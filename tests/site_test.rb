require 'minitest/autorun'
require 'nokogiri'
require 'uri'
require 'cgi'
require 'yaml'
require 'date'
require 'jekyll'

class SiteTest < Minitest::Test
  ROOT = File.expand_path('../_site', __dir__)
  PROJECT_IDS = %w[portfolio-os ideas lg-tv-use evalanche carta sea-temperature gm10 eva eva-protocol team1 hundred pommidoro parcelpilot redbridge acps routescan]
  ROUTES = %w[ideas/support/index.html ideas/privacy/index.html ideas/terms/index.html helicon-and-the-price-of-future-avax/index.html index.html projects/index.html blog/index.html notes/index.html speaking/index.html about/index.html now/index.html newsletter/index.html en/about/index.html 404.html] + PROJECT_IDS.map { |id| "projects/#{id}/index.html" }
  def doc(route)
    Nokogiri::HTML(File.read(File.join(ROOT, route)))
  end

  def test_core_pages_have_semantic_structure_and_one_heading
    ROUTES.each do |route|
      page = doc(route)
      assert_equal 1, page.css('main').length, route
      assert_equal 1, page.css('h1').length, route
      assert_equal 1, page.css('nav.site-nav').length, route
      menu = page.at_css('nav.site-nav .nav-menu-toggle[aria-expanded="false"]')
      refute_nil menu, route
      assert page.at_css("nav.site-nav .nav-row##{menu['aria-controls']}"), route
      assert_equal 1, page.css('script[src="/assets/js/nav-menu.js"][defer]').length, route
      assert_equal 1, page.css('link[rel="canonical"]').length, route
      assert_match %r{\Ahttps://jaack.me/}, page.at_css('link[rel="canonical"]')['href'], route
      assert page.at_css('a[href="#main-content"]'), route
    end
  end

  def test_theme_localization_uses_the_package_without_a_site_relabeler
    page = doc('index.html')
    assert_equal 1, page.css('script[src="/assets/jaack-design-system/theme.js"]').length
    assert_equal 1, page.css('script[src="/assets/js/language.js"]').length
    assert_empty page.css('script[src="/assets/js/theme-labels.js"]')
    refute File.exist?(File.join(ROOT, 'assets/js/theme-labels.js'))
  end

  def test_booking_accessible_name_is_server_rendered_in_each_page_language
    { 'it' => 'Prenota una call', 'en' => 'Book a call' }.each do |lang, label|
      page = doc("2024-review-#{lang}/index.html")
      assert_equal lang, page.at_css('html')['lang']
      booking = page.at_css('nav.site-nav a[data-booking-link]')
      refute_nil booking
      assert_equal label, booking['aria-label']
      assert_equal 'Book a call', booking.at_css('.lang-en').text
      assert_equal 'Prenota', booking.at_css('.nav-bar-label').text
      assert_equal 'Prenota una call', booking.at_css('.nav-menu-label').text
    end
    assert_equal 'Book a call', doc('index.html').at_css('[data-booking-link]')['aria-label']
  end

  def test_chrome_names_start_with_visible_text
    nav = doc('index.html').at_css('nav.site-nav')
    mark = nav.at_css('.jk-mark')
    refute mark.key?('aria-label')
    assert_empty mark.css('[aria-hidden="true"]')
    assert_equal 'jaack.me, home', mark.text
    assert_equal ', home', mark.at_css('.visually-hidden').text
    { 'en' => ['EN', ' English'], 'it' => ['IT', ' Italiano'] }.each do |lang, (visible, suffix)|
      button = nav.at_css(".lang-switch button[data-lang='#{lang}']")
      refute button.key?('aria-label')
      assert button.key?('aria-pressed')
      assert_equal lang, button['lang']
      assert_equal visible + suffix, button.text
      assert_equal suffix, button.at_css('.visually-hidden').text
    end
  end

  def test_built_shell_preserves_single_row_insets_and_compact_sheet
    css = File.read(File.join(ROOT, 'assets/css/jaack-site.css')).gsub(%r{/\*.*?\*/}m, '')
    assert_match /nav\.site-nav\.jk-top\s*\{[^}]*padding:\s*6px 18px;/, css
    assert_match /nav\.site-nav\.jk-top\.has-menu\.is-compact\s*\{[^}]*padding-left:\s*20px;[^}]*padding-right:\s*20px;/, css
    assert_match /nav\.site-nav\.has-menu\.is-compact \.jk-mark\s*\{[^}]*margin:\s*0;[^}]*margin-right:\s*auto;/, css
    assert_match /:root \{ --jk-bar-h: 57px; \}/, css
    assert_match /footer\.footer-main \{ margin-top: auto;/, css
    assert_match /min-height: 100svh;/, css
    assert_includes css, '.jk-page > main > :nth-child(1 of :not([hidden]))'
    # The no-cover regression has a hidden translation marker before its H1.
    assert doc('zk-evms-en/index.html').at_css('main > [hidden]:first-child + h1.title')
    ROUTES.each do |route|
      wrapper = doc(route).at_css('.jk-page')
      assert_equal %w[main footer], wrapper.element_children.map(&:name), route
    end
  end

  def test_internal_links_and_assets_on_updated_pages_resolve
    ROUTES.each do |route|
      page = doc(route)
      page.css('a[href], img[src], script[src], link[rel="stylesheet"]').each do |element|
        value = element['href'] || element['src']
        next if !value || value.empty? || value.match?(%r{\A(?:[a-z]+:|//)}i)
        target, fragment = value.split('#', 2)
        target = CGI.unescape((target || '').split('?').first.to_s)
        target = route if target.empty?
        target = target.start_with?('/') ? target.delete_prefix('/') : File.join(File.dirname(route), target) unless target == route
        path = File.join(ROOT, target)
        path = File.join(path, 'index.html') if File.directory?(path)
        path += '.html' if !File.exist?(path) && File.exist?(path + '.html')
        assert File.file?(path), "#{route}: missing #{value}"
        if fragment && !fragment.empty? && File.extname(path) == '.html'
          ids = Nokogiri::HTML(File.read(path)).css('[id]').map { |n| n['id'] }
          assert_includes ids, fragment, "#{route}: missing anchor #{value}"
        end
      end
    end
  end

  def test_homepage_features_real_project_and_writing_destinations
    page = doc('index.html')
    assert_equal 4, page.css('#selected-work article').length
    assert_equal 3, page.css('.selected-writing .dated-row').length
    assert page.at_css('#contact a[href^="mailto:"]')
    refute_includes page.text, 'Builder on the side'
  end

  def test_work_states_are_present_in_both_languages
    entries = doc('projects/index.html').css('.work-entry')
    assert_equal 16, entries.length
    entries.each do |entry|
      %w[en it].each do |lang|
        refute_empty entry.at_css(".work-meta .lang-#{lang}").text.strip
        refute_empty entry.at_css(".work-detail .lang-#{lang}").text.strip
      end
    end
  end

  def test_current_work_and_former_employment_are_kept_distinct
    work = doc('projects/index.html')
    former = work.at_css('section[aria-labelledby="group-past"] #routescan')
    refute_nil former
    assert_includes former.at_css('.work-meta .lang-en').text, 'Former Head of Growth'
    assert_includes former.at_css('.work-meta .lang-en').text, 'May 2026'
    assert_includes former.at_css('.work-detail .lang-it').text, 'Ho lasciato'
    featured = doc('index.html').css('#selected-work h3 a').map { |link| link['href'] }
    refute_includes featured, '/projects/routescan/'
    assert_includes featured, '/projects/eva-protocol/'
    assert_includes featured, '/projects/team1/'
    assert_includes work.at_css('#team1 .work-meta .lang-en').text, 'DevRel'
    assert_includes work.at_css('#team1 .work-meta .lang-en').text, 'Italy Coordinator'
    assert_includes work.at_css('#redbridge .work-meta .lang-en').text, 'Active advisory'
    apps = work.css('section[aria-labelledby="group-apps"] .work-entry').map { |entry| entry['id'] }
    assert_equal %w[carta hundred parcelpilot pommidoro sea-temperature], apps.sort

    %w[about/index.html en/about/index.html].each do |route|
      page = doc(route)
      assert_includes page.at_css('.about-body .lang-en').text, 'I left in May 2026'
      assert_includes page.at_css('.about-body .lang-it').text, "Ho lasciato l'azienda"
    end
    bio = doc('acp-255-four-fee-curves-en/index.html').at_css('.author .bio').text
    assert_includes bio, 'Independent builder'
    assert_includes bio, 'Former Head of Growth at Routescan'
    assert_includes bio, 'DevRel at Team1'
    assert_includes doc('acp-255-four-fee-curves-en/index.html').at_css('.author .bio .lang-it').text, 'DevRel in Team1'
  end

  def test_archived_newsletter_does_not_collect_signups
    page = doc('newsletter/index.html')
    assert_empty page.css('form, input, iframe')
    assert_includes page.text, 'no longer published'
    refute_includes page.text, 'coming months'
  end

  def test_visual_portfolio_preserves_navigation_and_project_relationships
    home = doc('index.html')
    assert_equal 1, home.css('.feature-lead').length
    assert home.at_css('.feature-lead h3 a[href="/projects/team1/"]')
    assert_equal 'team1', home.at_css('.feature-lead h3 img')['alt']
    assert home.at_css('.feature-lead .team1-feature-visual img[src="/assets/images/work/team1-announcement.jpg"]')
    assert_equal %w[/projects/team1/ /projects/gm10/ /projects/eva-protocol/ /projects/evalanche/], home.css('#selected-work h3 a').map { |link| link['href'] }
    assert_equal 3, home.css('.featured-secondary .project-feature').length
    assert home.at_css('.feature-eva-protocol .feature-image img[src="/assets/images/work/eva-protocol-preview.png"]')
    assert home.at_css('.feature-evalanche .feature-image img[src="/assets/images/work/evalanche-preview.png"]')
    assert home.at_css('.feature-evalanche h3 .evalanche-logo[src="/assets/images/work/evalanche-logo.svg"]')
    assert_equal 5, home.css('.app-links a').length
    carta = home.at_css('.app-links a[href="/projects/carta/"]')
    refute_nil carta
    refute_includes carta.text, '100'
    assert_empty carta.css('img')
    monogram = carta.at_css('.app-monogram[aria-hidden="true"]')
    refute_nil monogram
    assert_equal 'C', monogram.text
    accessible_link = carta.dup
    accessible_link.css('[aria-hidden="true"]').remove
    assert_equal 'Carta', accessible_link.text
    hundred = home.at_css('.app-links a[href="/projects/hundred/"]')
    assert_equal '100', hundred.at_css('.app-monogram[aria-hidden="true"]').text
    intro = home.at_css('.app-gallery .section-intro')
    assert_equal 'The sea, a workout, a focused hour, a delivery, a thread. Five native apps I’m working on.', intro.at_css('.lang-en[lang="en"]').text
    assert_equal 'Il mare, un allenamento, un’ora di concentrazione, una consegna, un thread. Cinque app native a cui sto lavorando.', intro.at_css('.lang-it[lang="it"]').text
    home.css('.project-feature img, .app-gallery img, .hero-portrait').each do |img|
      assert img.key?('alt'), 'Image needs an accessible text alternative'
      assert img['width'].to_i > 0
      assert img['height'].to_i > 0
    end
    work = doc('projects/index.html')
    assert_equal 'C', work.at_css('#carta .app-monogram[aria-hidden="true"]').text
    assert_equal '100', work.at_css('#hundred .app-monogram[aria-hidden="true"]').text
    assert_equal 6, work.css('.work-jumps a').length
    assert_equal 5, work.css('.app-grid .app-entry').length
    assert_equal %w[eva eva-protocol], work.css('.project-family .work-entry').map { |entry| entry['id'] }
    ids = work.css('[id]').map { |entry| entry['id'] }
    assert_equal ids.uniq, ids, 'Project anchors must remain unique'
  end

  def test_pommidoro_image_dimensions_match_both_previews
    path = '/assets/images/work/pommidoro-screen.jpg'
    jpeg = File.binread(File.join(ROOT, path.delete_prefix('/')))
    assert_equal "\xFF\xD8".b, jpeg.byteslice(0, 2)
    offset = 2
    dimensions = nil
    while offset < jpeg.bytesize
      assert_equal 0xff, jpeg.getbyte(offset), 'Expected a JPEG segment'
      marker = jpeg.getbyte(offset + 1)
      length = jpeg.byteslice(offset + 2, 2).unpack1('n')
      if [0xc0, 0xc2].include?(marker) # Baseline or progressive JPEG frame.
        dimensions = jpeg.byteslice(offset + 5, 4).unpack('nn').reverse
        break
      end
      break if marker == 0xda # Image data must follow a frame header.
      offset += 2 + length
    end
    assert_equal [445, 985], dimensions
    %w[index.html projects/pommidoro/index.html].each do |route|
      img = doc(route).at_css("img[src='#{path}']")
      refute_nil img, route
      assert_equal dimensions, [img['width'].to_i, img['height'].to_i], route
    end
  end

  def test_existing_special_pages_and_article_assets_survive
    %w[team1/index.html hundred/privacy/index.html hundred/support/index.html ideas/support/index.html ideas/privacy/index.html ideas/terms/index.html].each do |route|
      assert File.file?(File.join(ROOT, route)), route
    end
    page = doc('acp-255-four-fee-curves-en/index.html')
    assert page.at_css('script[src*="acp-255-formula-explorer.js"]')
    assert page.at_css('.wrapper-xwide')
    assert_equal 1, page.css('h1').length
    assert page.at_css('main.post')
    assert_empty page.css('beeline-button, script[src*="beeline"]')
    assert_empty doc('index.html').css('beeline-button, script[src*="beeline"]')
    assert_match /\A\d{4}-\d{2}-\d{2}\z/, page.at_css('time')['datetime']
  end

  def test_project_pages_have_roles_context_and_a_next_step
    PROJECT_IDS.each do |id|
      page = doc("projects/#{id}/index.html")
      assert_equal 2, page.css('.project-facts dd').length, id
      assert page.at_css('.project-next a[href]'), id
      %w[en it].each do |lang|
        assert page.css(".project-page p .lang-#{lang}").length >= 3, "#{id}: translated context"
      end
      assert page.at_css("a[href='/projects/##{id}']"), id
    end
  end

  def test_project_video_is_dormant_everywhere_except_carta
    paths = Dir.glob(File.join(ROOT, '**', '*.html'))
    refute_empty paths
    paths.each do |path|
      next if path == File.join(ROOT, 'projects/carta/index.html')
      page = Nokogiri::HTML(File.read(path))
      assert_empty page.css('.project-video, script[src="/assets/js/project-video.js"]'), path
    end
    assert doc('projects/pommidoro/index.html').at_css('.project-page.project-page--pommidoro')
  end

  def test_project_video_include_renders_generic_bilingual_v11_markup
    site = Jekyll::Site.new(Jekyll.configuration(
      'source' => File.expand_path('..', __dir__), 'destination' => ROOT, 'quiet' => true
    ))
    site.data['projects'] = %w[demo another-project].map do |id|
      { 'id' => id, 'video_caption_en' => "#{id}'s caption <sample>",
        'video_caption_it' => "#{id}: didascalia & esempio",
        'video_desc_en' => "#{id}: English description",
        'video_desc_it' => "#{id}: descrizione italiana" }
    end
    site.data['projects'].each do |project|
      id = project.fetch('id')
      html = site.liquid_renderer.file('project-video-fixture').parse(
        '{% include project-video.html id=fixture_id %}'
      ).render!(site.site_payload.merge('fixture_id' => id), registers: { site: site })
      page = Nokogiri::HTML5.fragment(html)
      figure = page.at_css('figure.project-video')
      refute_nil figure
      assert_equal id, figure['data-pv']
      assert_equal %w[div button p figcaption], figure.element_children.map(&:name)
      assert figure.element_children.first.matches?('.pv-stage')
      assert figure.element_children[1].matches?('button.pv-toggle')
      assert figure.element_children[2].matches?('p.visually-hidden')
      assert_equal 'figcaption', figure.element_children.last.name
      assert_empty page.css('.pv-bar')

      video = figure.at_css('.pv-stage > video.pv-media')
      assert_equal "pv-video-#{id}", video['id']
      assert_equal %w[358 770], [video['width'], video['height']]
      assert_equal 'none', video['preload']
      %w[muted loop playsinline disablepictureinpicture].each { |attr| assert video.key?(attr), attr }
      %w[poster autoplay controls].each { |attr| refute video.key?(attr), attr }
      path = "/assets/images/work/#{id}/#{id}-site-"
      assert_equal path, figure['data-pv-src']
      assert_empty video.css('source')
      refute video.key?('src')

      picture = figure.at_css('.pv-stage > picture.pv-poster')
      assert_equal %w[source source source img], picture.element_children.map(&:name)
      assert_equal %w[wide-poster.webp wide-poster.png compact-poster.webp].map { |s| path + s }, picture.css('source').map { |s| s['srcset'] }
      assert_equal ['(min-width: 776px)', '(min-width: 776px)', nil], picture.css('source').map { |s| s['media'] }
      assert_equal %w[image/webp image/png image/webp], picture.css('source').map { |s| s['type'] }
      picture.css('source[media]').each { |s| assert_equal %w[720 820], [s['width'], s['height']] }
      poster = picture.at_css('img')
      assert_equal path + 'compact-poster.png', poster['src']
      assert_equal %w[358 770], [poster['width'], poster['height']]
      assert_equal '', poster['alt']
      assert_equal 'eager', poster['loading']
      assert_equal 'async', poster['decoding']
      assert_equal 'high', poster['fetchpriority']

      button = figure.at_css('button.pv-toggle[hidden]')
      refute_nil button
      assert_equal 'button', button['type']
      assert_equal video['id'], button['aria-controls']
      refute button.key?('aria-pressed')
      assert_equal 2, button.css('svg[aria-hidden="true"]').length
      { 'aria-describedby' => ['p.visually-hidden', 'desc'],
        'aria-labelledby' => ['figcaption', 'caption'] }.each do |attribute, (selector, field)|
        target = figure.at_css("##{video[attribute]}")
        refute_nil target, attribute
        assert target.matches?(selector), attribute
        %w[en it].each do |lang|
          assert_equal project.fetch("video_#{field}_#{lang}"), target.at_css(".lang-#{lang}[lang='#{lang}']").text
        end
      end
      assert_equal 1, page.css('script[src="/assets/js/project-video.js"][defer]').length
    end
  end

  def test_carta_has_a_hero_video_and_a_standard_project_entry
    page = doc('projects/carta/index.html')
    assert page.at_css('.project-page--carta')
    assert_equal 'Carta', page.at_css('h1').text
    figure = page.at_css('figure.project-video')
    refute_nil figure
    assert_empty page.css('figure.project-art')
    assert_equal 1, page.css('video').length
    video = figure.at_css('video[muted][loop][playsinline][disablepictureinpicture]')
    refute_nil video
    refute video.key?('poster')
    refute video.key?('src')
    assert_empty video.css('source')
    path = '/assets/images/work/carta/carta-site-'
    assert_equal path, figure['data-pv-src']
    %w[wide.webm wide.mp4 compact.webm compact.mp4].each do |suffix|
      assert File.file?(File.join(ROOT, (path + suffix).delete_prefix('/'))), suffix
    end
    assert figure.at_css('.pv-poster img[src="' + path + 'compact-poster.png"]')
    caption = figure.element_children.last
    assert_equal 'figcaption', caption.name
    project = YAML.safe_load_file(File.expand_path('../_data/projects.yml', __dir__)).find { |p| p['id'] == 'carta' }
    %w[en it].each do |lang|
      assert_equal project.fetch("video_caption_#{lang}"), caption.at_css(".lang-#{lang}[lang='#{lang}']").text
      assert_equal project.fetch("video_desc_#{lang}"), figure.at_css("p.visually-hidden .lang-#{lang}[lang='#{lang}']").text
    end
    assert_includes page.text, 'Dividi qui'
    assert_includes page.text, '29 characters over'
    assert_includes page.text, 'The clip shows the Publish sheet'
    assert_includes page.text, 'Il video mostra il foglio Pubblica'
    assert_equal 1, page.css('script[src="/assets/js/project-video.js"][defer]').length
    front_matter = YAML.safe_load_file(File.expand_path('../projects/carta/index.md', __dir__))
    assert_equal 'carta', front_matter['hero_video']
    assert_empty front_matter.keys.grep(/\A(?:image|cover)/)
    assert page.at_css('.project-next a[href="mailto:hey@jaack.me?subject=Carta"]')
    assert page.at_css('a[href="/projects/#carta"]')
    entry = doc('projects/index.html').at_css('.app-grid #carta')
    assert entry.at_css('h3 a[href="/projects/carta/"]')
    assert_equal 'C', entry.at_css('.app-monogram[aria-hidden="true"]').text
    refute entry.at_css('.app-icon, .text-link')
    refute doc('projects/pommidoro/index.html').at_css('.project-video, script[src="/assets/js/project-video.js"]')
  end

  def test_lg_tv_use_links_public_release_and_describes_evidence_limits
    page = doc('projects/lg-tv-use/index.html')
    assert page.at_css('a[href="https://github.com/iJaack/lg-tv-use"]')
    assert page.at_css('a[href="https://github.com/iJaack/lg-tv-use/releases/tag/v0.3.1"]')
    assert_includes page.text, '17 MCP tools'
    assert_includes page.text, '55 automated tests'
    assert_includes page.text, 'Internal app navigation remains experimental'
    assert_includes page.text, 'power-off and wake were verified on one'
    assert_includes page.text, 'navigazione interna delle app resta sperimentale'
    image = page.at_css('meta[property="og:image"]')
    assert_equal 'https://jaack.me/assets/images/work/lg-tv-use-cover.png', image['content']
    assert page.at_css('img[src="/assets/images/work/lg-tv-use-cover.png"][alt]')
    assert doc('projects/index.html').at_css('#lg-tv-use h3 a[href="/projects/lg-tv-use/"]')
  end

  def test_evalanche_links_public_code_package_and_release
    page = doc('projects/evalanche/index.html')
    assert page.at_css('a[href="https://github.com/iJaack/evalanche"]')
    assert page.at_css('a[href="https://www.npmjs.com/package/evalanche"]')
    assert page.at_css('a[href="https://github.com/iJaack/evalanche/releases/tag/v1.14.0"]')
    assert page.at_css('a[href="https://evalanche.xyz"]')
    assert_includes page.text, 'Node.js 20 or newer'
    assert_includes page.text, 'Node.js 20 o successivo'
    work = doc('projects/index.html')
    assert work.at_css('section[aria-labelledby="group-systems"] #evalanche h3 a[href="/projects/evalanche/"]')
  end

  def test_reading_paths_preserve_the_archive_and_real_articles
    page = doc('blog/index.html')
    assert_equal 3, page.css('.reading-path').length
    assert_equal 7, page.css('.reading-pick').length
    assert_equal 3, page.css('.reading-pick .work-meta').length
    assert page.at_css('#archive')
    refute page.at_css('#fitness')
    %w[en it].each do |lang|
      assert page.css("section.list.lang-#{lang} .dated-row").length > 0
    end
    page.css('.reading-pick > a').each do |link|
      article = doc(link['href'].delete_prefix('/') + 'index.html')
      assert article.at_css('main.post'), link['href']
    end
    assert_equal 6, doc('now/index.html').css('.now-priorities li').length
  end

  def migrated_notes
    @migrated_notes ||= Dir.glob(File.expand_path('../_notes/*.md', __dir__)).to_h do |path|
      front_matter = File.read(path).match(/\A---\s*\n(.*?)\n---\s*\n/m)
      refute_nil front_matter, path
      [path, YAML.safe_load(front_matter[1], permitted_classes: [Time, Date])]
    end
  end

  def test_migrated_notes_preserve_titles_and_use_local_links_and_images
    assert_equal 30, migrated_notes.length
    assert_empty Dir.glob(File.expand_path('../_posts/*', __dir__)).select { |path| File.read(path).match?(/^original_url:/) }
    migrated_notes.each do |path, data|
      slug = File.basename(path, '.md')
      assert_equal "/#{slug}/", data['permalink'], path
      assert_equal 'note', data['layout'], path
      refute_equal 'blog', data['category'], path
      refute_includes Array(data['categories']), 'blog', path
      route = "#{slug}/index.html"
      assert File.file?(File.join(ROOT, route)), "#{path}: missing #{route}"
      page = doc(route)
      assert_equal 1, page.css('h1').length, route
      assert_equal data['title'], page.at_css('h1').text.strip, route
      assert_equal 1, page.css('article.note').length, route
      assert_equal DateTime.parse(data['date'].to_s).strftime('%F %T'), DateTime.parse(page.at_css('.note-meta time[datetime]')['datetime']).strftime('%F %T'), route
      assert_equal data['tag'], page.css('.note-header .note-tag').map { |chip| chip.text.strip }, route
      data['tag'].each do |tag|
        assert page.at_css(".note-header .note-tag[href='/notes/#tag-#{tag}']"), route
      end
      assert page.at_css('.note-back[href="/notes/"]'), route
      assert_equal 1, page.css('.note-source').length, route
      source = page.at_css('.note-source')
      refute_equal 'a', source.name, route
      host = URI.parse(data['original_url']).host
      assert_equal host, source.text, route
      assert_includes page.at_css('.note-origin').text, "Originally published on #{host}", route
      assert_empty page.css('.author, .related, .blog-navigation, beeline-button, script[src*="beeline"], .title-image, .donation, .newsletter'), route
      page.css('h1, h2, h3, h4, h5, h6').each do |heading|
        last = heading.children.reject { |node| node.text? && node.text.strip.empty? }.last
        refute last&.name == 'a' && last.text.strip == '#', "#{route}: trailing heading permalink"
      end
      refute page.at_css('[href^="/tags/"]'), "#{route}: legacy /tags/ link"
      refute_includes File.read(File.join(ROOT, route)), 'imagedelivery.net', route
      page.css('img[src]').each do |image|
        value = image['src']
        next if value.match?(%r{\A(?:[a-z][a-z0-9+.-]*:|//)}i)
        target = URI::DEFAULT_PARSER.unescape(value.split(/[?#]/, 2).first.to_s)
        target = target.start_with?('/') ? target.delete_prefix('/') : File.join(File.dirname(route), target)
        assert File.file?(File.join(ROOT, target)), "#{route}: missing image #{value}"
      end
    end
  end

  def test_retired_note_hosts_are_not_linked_anywhere_in_the_site
    allowed_url = 'https://blog.montaigne.io/proliferation-of-tools'
    allowed_route = 'proliferation-of-tools/index.html'
    assert doc(allowed_route).at_css("a[href='#{allowed_url}']"), 'Preserve the third-party article link'

    paths = Dir.glob(File.join(ROOT, '**', '*.html'))
    refute_empty paths
    paths.each do |path|
      route = path.delete_prefix(ROOT + '/')
      doc(route).css('[href]').each do |element|
        href = element['href']
        next unless href.match?(%r{\A(?:[a-z][a-z0-9+.-]*:)?//}i)

        host = URI.parse(URI::DEFAULT_PARSER.escape(href)).host.to_s.downcase
        next unless host.match?(/(?:\A|\.)(?:montaigne\.io|30s\.fit)\z/)

        assert_equal allowed_url, href, "#{route}: retired host in href #{href}"
        assert_equal allowed_route, route, "#{route}: third-party article link is only allowed on /proliferation-of-tools/"
      end
    end
  end

  def test_notes_and_speaking_are_excluded_from_blog_surfaces_and_feed
    excluded = migrated_notes.values.map { |data| data['permalink'] } + ['/speaking/', '/speaking-portfolio/']
    blog_links = doc('blog/index.html').css('.reading-paths a, section.list a').map { |link| link['href'] }
    home_links = doc('index.html').css('.selected-writing a').map { |link| link['href'] }
    assert_empty excluded & blog_links
    assert_empty excluded & home_links
    feed = Nokogiri::XML(File.read(File.join(ROOT, 'feed.xml')))
    feed.remove_namespaces!
    entry_urls = feed.xpath('//entry/link/@href | //entry/id').map(&:text)
    excluded.each do |url|
      refute entry_urls.any? { |entry_url| entry_url == url || entry_url.end_with?(url) }, "Feed includes note URL #{url}"
    end
    Dir.glob(File.join(ROOT, '**', 'index.html')).each do |path|
      links = Nokogiri::HTML(File.read(path)).css('.related a, .blog-navigation a').map { |link| link['href'] }
      assert_empty excluded & links, path
    end
  end

  def test_notes_index_lists_groups_tags_and_all_notes_in_date_order
    page = doc('notes/index.html')
    notes_by_url = migrated_notes.values.to_h { |data| [data['permalink'], data] }
    all_links = page.css('#all-notes .dated-row > a').map { |link| link['href'] }
    assert_equal 30, all_links.length
    assert_equal notes_by_url.keys.sort, all_links.sort
    dates = all_links.map { |url| DateTime.parse(notes_by_url.fetch(url)['date'].to_s) }
    assert_equal dates.sort.reverse, dates
    assert page.at_css('section#fitness')
    fitness_links = page.css('#fitness .dated-row > a').map { |link| link['href'] }
    assert_equal %w[/jun-7-th-2024-start/ /jun-7-th-2024-understanding-tp-numbers/ /jun-22-nd-2024-understanding-form-and-fatigue/ /aug-5-th-2024-in-search-of-the-complete-training-app/ /jan-13-th-2025-wrapping-up-2024/], fitness_links
    dates = fitness_links.map { |url| DateTime.parse(notes_by_url.fetch(url)['date'].to_s) }
    assert_equal dates.sort, dates
    tags = notes_by_url.values.flat_map { |data| data['tag'] }.uniq.sort
    assert_equal tags.map { |tag| "tag-#{tag}" }, page.css('section[id^="tag-"]').map { |section| section['id'] }
    tags.each do |tag|
      links = page.css("#tag-#{tag} .dated-row > a").map { |link| link['href'] }
      assert_equal all_links.select { |url| notes_by_url.fetch(url)['tag'].include?(tag) }, links
      assert page.at_css(".work-jumps a[href='#tag-#{tag}']"), tag
    end
    assert page.at_css('.work-jumps a[href="#fitness"]')
    page.css('.dated-row').each do |entry|
      data = notes_by_url.fetch(entry.at_css('a')['href'])
      assert_equal DateTime.parse(data['date'].to_s).strftime('%F %T'), DateTime.parse(entry.at_css('time[datetime]')['datetime']).strftime('%F %T')
      assert_empty entry.css('.note-tag, .badge')
    end
  end

  def test_speaking_is_a_standalone_page_and_navigation_targets_are_correct
    assert File.file?(File.expand_path('../speaking.md', __dir__))
    refute File.exist?(File.expand_path('../_posts/2023-09-11-speaking-portfolio.md', __dir__))
    refute File.exist?(File.join(ROOT, 'speaking-portfolio'))
    page = doc('speaking/index.html')
    assert_equal 1, page.css('h1').length
    assert_equal 'Speaking', page.at_css('h1 .lang-en').text
    assert_equal 'Interventi', page.at_css('h1 .lang-it').text
    %w[2022 2023 2024].each do |year|
      assert_includes page.css('h2').map { |heading| heading.text.strip }, year
    end
    assert_includes page.text, 'Avalanche Summit'
    refute page.at_css('article.note, main.post')
    ROUTES.each do |route|
      nav = doc(route).at_css('nav.site-nav')
      assert nav.at_css('a[href="/notes"]'), route
      assert nav.at_css('a[href="/speaking"]'), route
      refute nav.at_css('a[href="/notes"][aria-current]'), route unless route == 'notes/index.html'
    end
    assert doc('notes/index.html').at_css('nav.site-nav a[href="/notes"][aria-current="page"]')
    assert page.at_css('nav.site-nav a[href="/speaking"][aria-current="page"]')
    migrated_notes.values.each do |data|
      nav = doc(data['permalink'].delete_prefix('/') + 'index.html').at_css('nav.site-nav')
      assert_equal ['/notes'], nav.css('[aria-current="page"]').map { |link| link['href'] }
    end
  end

  def test_2024_review_pages_no_longer_link_to_30s_fit
    %w[2024-review 2024-review-en 2024-review-it].each do |slug|
      route = "#{slug}/index.html"
      assert File.file?(File.join(ROOT, route)), route
      assert doc(route).at_css('a[href="/notes/#fitness"]'), route
      assert doc(route).at_css('a[href="/jan-13-th-2025-wrapping-up-2024/"]'), route
      doc(route).css('a[href]').each do |link|
        refute_match(/30s\.fit/i, link['href'], route)
      end
    end
  end

  def test_stealth_project_is_absent_from_published_site
    refute File.exist?(File.join(ROOT, 'projects/thicc/index.html'))
    Dir.glob(File.join(ROOT, '**', '*.html')).each do |path|
      refute_match(/thicc/i, File.read(path), path)
    end
    sitemap = File.join(ROOT, 'sitemap.xml')
    refute_match(/thicc/i, File.read(sitemap)) if File.file?(sitemap)
  end

  def test_helicon_research_keeps_evidence_and_is_discoverable
    page = doc('helicon-and-the-price-of-future-avax/index.html')
    assert_equal 'helicon and the price of future AVAX', page.at_css('h1').text
    assert_equal 2, page.css('.post-body table').length
    assert_equal 10, page.css('.post-body table').first.css('tbody tr').length
    assert_equal 8, page.css('.footnotes > ol > li').length
    assert_equal '2026-09-09', page.at_css('time')['datetime']
    assert_includes page.at_css('.post-body').text, 'None of the returns below measures Helicon’s effect.'
    assert page.at_css('a[href="/assets/research/helicon/reproduction.zip"]')
    assert page.at_css('img[src="/assets/research/helicon/avax-monthly.svg"]')
    assert page.at_css('script[src*="/assets/research/helicon/chart.js"]')
    assert page.at_css('input#avax-month[type="range"]')
    assert page.at_css('script#avax-history-data[type="application/json"]')
    picks = doc('blog/index.html').at_css('section[aria-labelledby="crypto"]')
    assert picks.at_css('a[href="/helicon-and-the-price-of-future-avax/"]')
  end

  def test_build_does_not_publish_development_files
    %w[tests scripts Gemfile package.json vendor].each do |name|
      refute File.exist?(File.join(ROOT, name)), name
    end
  end

  def test_sitemap_lists_canonical_pages_without_the_legacy_about_duplicate
    sitemap = Nokogiri::XML(File.read(File.join(ROOT, 'sitemap.xml')))
    urls = sitemap.xpath('//*[local-name()="loc"]').map(&:text)
    assert_includes urls, 'https://jaack.me/'
    assert_includes urls, 'https://jaack.me/about/'
    assert_includes urls, 'https://jaack.me/projects/carta/'
    %w[/google780112932c0baf19.html /workflows/ /404.html /en/404.html].each do |path|
      refute_includes urls, 'https://jaack.me' + path
    end
    refute urls.any? { |url| url.match?(%r{/assets/jaack-design-system/components/.*\.html\z}) }
    pdfs = Dir.glob(File.join(ROOT, 'assets/docs/**/*.pdf'))
    refute_empty pdfs
    pdfs.each { |path| assert_includes urls, 'https://jaack.me/' + path.delete_prefix(ROOT + '/') }
    assert_includes urls, 'https://jaack.me/helicon-and-the-price-of-future-avax/'
    refute_includes urls, 'https://jaack.me/en/about/'
    refute_includes urls, 'https://jaack.me/index'
    assert_equal 'https://jaack.me/about/', doc('en/about/index.html').at_css('link[rel="canonical"]')['href']
    assert_includes File.read(File.join(ROOT, 'robots.txt')), 'Sitemap: https://jaack.me/sitemap.xml'
  end

  def render_post_fixture(template, values = {})
    site = Jekyll::Site.new(Jekyll.configuration(
      'source' => File.expand_path('..', __dir__), 'destination' => ROOT, 'quiet' => true
    ))
    site.data['ui_text'] = YAML.safe_load(File.read(File.expand_path('../_data/ui_text.yml', __dir__)))
    site.liquid_renderer.file('post-fixture').parse(template).render!(
      site.site_payload.to_h.merge(values), registers: { site: site }
    )
  end

  def test_post_measure_defaults_and_normal_opt_out_are_server_rendered
    layout = File.read(File.expand_path('../_layouts/default.html', __dir__))
    main_tag = layout.match(/<main\b.*?>/m)[0]
    [nil, 'long', 'normal'].each do |measure|
      node = Nokogiri::HTML.fragment(render_post_fixture(main_tag, 'page' => {
        'layout' => 'post', 'measure' => measure
      })).at_css('main.post')
      refute_nil node
      measure == 'normal' ? assert_equal('normal', node['data-measure']) : assert_nil(node['data-measure'])
    end
    %w[about/index.html en/about/index.html now/index.html cookies/index.html hundred/privacy/index.html harness-companion/index.html harness-companion/privacy/index.html newsletter/index.html proliferation-of-tools/index.html].each do |route|
      assert doc(route).at_css('main.jk-prose'), route
    end
    %w[index.html blog/index.html notes/index.html projects/index.html speaking/index.html projects/team1/index.html].each do |route|
      refute doc(route).at_css('main.jk-prose'), route
    end
  end

  def test_post_meta_is_one_localized_date_and_one_reading_time
    { 'en' => ['8 August 2022', 'min read'], 'it' => ['8 agosto 2022', 'min di lettura'] }.each do |lang, (date, label)|
      page = doc("zk-evms-#{lang}/index.html")
      meta = page.at_css('main > .post-meta')
      assert_equal date, meta.at_css('time').text.strip
      assert_equal 1, meta.css('.reading-time').length
      assert_match(/\A#{Regexp.escape(date)} · [1-9]\d* #{label}\z/, meta.text.gsub(/\s+/, ' ').strip)
      assert_equal %w[h1 p div], page.at_css('main').element_children.reject { |n| n.key?('hidden') }.first(3).map(&:name)
      assert_empty page.css('beeline-button, script[src*="beeline"]')
    end
    # The same date formatter covers September with a single-digit day.
    %w[en it].each do |lang|
      output = render_post_fixture("{% include post-date.html date=fixture_date lang=fixture_lang %}",
        'fixture_date' => Time.utc(2026, 9, 9), 'fixture_lang' => lang)
      assert_equal "9 #{lang == 'it' ? 'settembre' : 'September'} 2026", output.strip
    end
    # Preformatted text contributes to the count. Boundary cases enforce ceil / 220,
    # a single value, and the same minimum-one wording in both languages.
    { 0 => 1, 1 => 1, 220 => 1, 221 => 2, 440 => 2, 441 => 3 }.each do |words, minutes|
      %w[en it].each do |lang|
        content = "<p>Intro</p>\n<pre><code>" + ('word ' * [words - 1, 0].max) + '</code></pre>'
        content = '' if words.zero?
        html = render_post_fixture('{% include read-time.html %}', 'content' => content, 'page' => { 'lang' => lang })
        label = lang == 'it' ? 'min di lettura' : 'min read'
        assert_equal "#{minutes} #{label}", Nokogiri::HTML.fragment(html).text.strip
      end
    end
  end

  def test_cover_and_footer_follow_the_clean_post_order_in_both_languages
    %w[en it].each do |lang|
      page = doc("2024-review-#{lang}/index.html")
      children = page.at_css('main.post').element_children.reject { |n| n.key?('hidden') }
      assert children[0].matches?('h1.title')
      assert children[1].matches?('p.post-meta')
      assert page.at_css('main.post > .post-meta + img.title-image + .post-body')
      assert_empty page.css('beeline-button, script[src*="beeline"]')
      related = page.at_css('main > .related')
      refute_nil related
      donation = page.at_css('main > .donation')
      assert_operator children.index(donation), :>, children.index(related)
      assert_operator children.index(page.at_css('main > .author')), :>, children.index(donation)
      coffee = donation.at_css('a.coffee-link')
      assert_equal 'https://www.buymeacoffee.com/jaack', coffee['href']
      assert_equal '_blank', coffee['target']
      assert_equal %w[noopener noreferrer], coffee['rel'].split
      assert_equal '↗', coffee.at_css('[aria-hidden="true"]').text
      expected = lang == 'it' ? 'Se ti è stato utile, offrimi un caffè ↗' : 'If this was useful, buy me a coffee ↗'
      assert_equal expected, coffee.text.strip
      assert_empty donation.css('button, img, script, style')
      assert_empty page.css('script[src*="buymeacoffee"], img[src*="buymeacoffee"]')
    end
  end

  def test_missing_local_cover_is_omitted_and_present_cover_is_rendered
    missing = doc('installare-nodo-ipfs-en/index.html')
    assert_empty missing.css('main.post > .title-image')
    assert missing.at_css('main.post > .post-meta + .post-body')
    %w[en it].each do |lang|
      cover = doc("2024-review-#{lang}/index.html").at_css('main.post > img.title-image')
      refute_nil cover
      assert_equal '/assets/images/2025.png', cover['src']
    end
  end

  def test_cover_lookup_normalizes_local_paths_and_preserves_remote_covers
    layout = File.read(File.expand_path('../_layouts/post.html', __dir__))
    cases = {
      '/assets/present.jpg' => true, 'assets/present.jpg' => true, './assets/present.jpg' => true,
      '/assets/missing.jpg' => false, 'assets/missing.jpg' => false,
      'https://example.com/cover.jpg' => true, 'http://example.com/cover.svg' => true,
      '/assets/diagram.svg' => true
    }
    cases.each do |image, expected|
      html = render_post_fixture(layout,
        'site' => { 'static_files' => [{ 'path' => '/assets/present.jpg' }, { 'path' => '/assets/diagram.svg' }] },
        'page' => { 'image' => image, 'headerImage' => true, 'title' => 'Cover fixture' })
      cover = Nokogiri::HTML.fragment(html).at_css('img.title-image')
      assert_equal expected, !cover.nil?, image
      next unless cover
      assert_equal image, cover['src']
      assert_equal image.end_with?('.svg'), cover.classes.include?('figure--diagram'), image
    end
  end

  def test_diagram_selector_matches_svgs_and_author_markings_but_not_plain_rasters
    css = File.read(File.expand_path('../assets/css/jaack-site.css', __dir__))
    selector = css.match(/^\.post :is\((img\[src\$="\.svg"\].*)\) \{/)[1]
    # Nokogiri does not parse complex :is() lists; expand the equivalent union.
    selector = selector.split(', ').map { |part| ".post #{part}" }.join(', ')
    html = Nokogiri::HTML.fragment('<div class="post">
      <img id="svg" src="diagram.svg"><p><a><img id="codex" src="loops-codex.svg"></a></p>
      <img id="marked-image" class="figure--diagram" src="screenshot.png">
      <figure class="figure--diagram"><img id="marked-figure" src="photo.jpg"></figure>
      <img src="plain.jpg"><img src="plain.jpeg"><img src="plain.png">
      <img src="plain.webp"><img src="plain.gif"><img class="selfie" src="author.jpg">
      </div>')
    assert_equal %w[svg codex marked-image marked-figure], html.css(selector).map { |img| img['id'] }
  end

  def test_about_portrait_precedes_both_language_intros_in_the_prose_container
    %w[about/index.html en/about/index.html].each do |route|
      main = doc(route).at_css('main.jk-prose')
      refute_nil main
      children = main.at_css('.about-body').element_children
      assert children.first.matches?('img.about-portrait[width="160"]')
      assert_equal %w[lang-en lang-it], children.drop(1).map { |node| node['class'] }
    end
  end

  def test_related_is_dated_rows_of_at_most_three_same_language_posts
    Dir.glob(File.join(ROOT, '**', 'index.html')).each do |path|
      page = Nokogiri::HTML(File.read(path))
      next unless page.at_css('main.post')
      related = page.at_css('.related')
      next unless related
      assert_equal 'More writing', related.at_css('h2 .lang-en[lang="en"]').text
      assert_equal 'Altri articoli', related.at_css('h2 .lang-it[lang="it"]').text
      rows = related.css('ul.dated-rows > li.dated-row')
      assert_operator rows.length, :<=, 3, path
      assert_operator rows.length, :>, 0, path
      current_url = '/' + path.delete_prefix(ROOT + '/').delete_suffix('index.html')
      alternate = page.at_css('[data-alt-url]')&.[]('data-alt-url')
      urls = rows.map do |row|
        assert row.at_css('time[datetime]'), path
        assert_match(/\A\S+ \d{4}\z/, row.at_css('time').text.strip, path)
        assert_equal 1, row.css('a').length
        link = row.at_css('a')
        refute_includes link.text, '↗'
        refute_equal current_url, link['href'], path
        refute_equal alternate, link['href'], path
        target = doc(link['href'].delete_prefix('/') + 'index.html')
        assert_equal page.at_css('html')['lang'], target.at_css('html')['lang'], path
        link['href']
      end
      assert_equal urls.uniq, urls, path
    end
    # A controlled pool verifies filtering before the limit and deduping shared tags.
    posts = [
      { 'url' => '/current/', 'lang' => 'en' },
      { 'url' => '/translation/', 'lang' => 'en' },
      { 'url' => '/other-language/', 'lang' => 'it' },
      { 'url' => '/unrelated/', 'lang' => 'en', 'tags' => ['else'] }
    ] + (1..6).map { |n| { 'url' => "/candidate-#{n}/", 'lang' => 'en' } }
    posts.each do |post|
      post['tags'] ||= %w[one two]
      post['title'] = post['url']
      post['date'] = Time.utc(2026, 9, 9)
    end
    data = YAML.safe_load(File.read(File.expand_path('../_data/ui_text.yml', __dir__)))
    html = render_post_fixture('{% include related.html %}',
      'site' => { 'posts' => posts, 'data' => { 'ui_text' => data } },
      'page' => { 'url' => '/current/', 'lang' => 'en', 'tags' => %w[one two] },
      'alternate_post' => { 'url' => '/translation/' })
    assert_equal %w[/candidate-1/ /candidate-2/ /candidate-3/], Nokogiri::HTML.fragment(html).css('.dated-row a').map { |n| n['href'] }
  end

  def test_paired_posts_have_absolute_self_referencing_hreflang_in_head
    expected = {
      'en' => 'https://jaack.me/zk-evms-en/',
      'it' => 'https://jaack.me/zk-evms-it/',
      'x-default' => 'https://jaack.me/zk-evms-en/'
    }
    %w[en it].each do |lang|
      page = doc("zk-evms-#{lang}/index.html")
      links = page.css('head link[rel="alternate"][hreflang]')
      assert_equal expected, links.to_h { |n| [n['hreflang'], n['href']] }
      assert_equal 3, links.length
      assert_empty page.css('body link[hreflang]')
    end
    assert_empty doc('the-loops-i-set-up-so-my-agent-system-doesnt-lie-to-me/index.html').css('link[hreflang]')
  end

  def test_loops_keeps_original_svg_sources_without_dark_variant_swaps
    page = doc('the-loops-i-set-up-so-my-agent-system-doesnt-lie-to-me/index.html')
    cover = page.at_css('.title-image.figure--diagram')
    refute_nil cover
    assert_equal '/assets/images/2026/loops-cover-codex.svg', cover['src']
    assert_equal 5, page.css('.post-body img[src$="-codex.svg"]').length
    assert_empty page.css('main picture')
  end
  def test_dated_rows_are_shared_across_indexes_home_and_related
    %w[index.html blog/index.html notes/index.html speaking/index.html 2024-review-en/index.html].each do |route|
      page = doc(route)
      rows = page.css('ul.dated-rows > li.dated-row')
      assert_operator rows.length, :>, 0, route
      assert_empty page.css('.writing-entry, .note-entry, .badge.research'), route
      rows.each do |row|
        assert row.at_css('time[datetime]'), route
        assert row.at_css('a, .row-title'), route
        refute row.at_css('h3, .note-tag, .badge'), route
      end
    end
    refute_includes doc('blog/index.html').text, 'These selected essays are in English.'
    refute_includes doc('blog/index.html').text, 'Questi saggi selezionati sono in inglese.'
  end

  def test_speaking_keeps_existing_talks_and_date_precision
    data = YAML.safe_load(File.read(File.expand_path('../_data/speaking.yml', __dir__)))
    page = doc('speaking/index.html')
    assert_equal %w[2024 2023 2022], page.css('main h2').map { |h| h.text.strip }
    assert_equal 17, data.length
    assert_equal 17, page.css('.dated-row').length
    assert_equal 16, page.css('.dated-row > a').length
    assert_equal data.map { |talk| talk['url'] }.compact.sort, page.css('.dated-row > a').map { |a| a['href'] }.sort
    assert_equal '2022-05', data.find { |talk| talk['url'].nil? }['date']
    assert_equal 1, page.css('.dated-row > .row-title').length
    assert_equal 2024, data.map { |talk| talk['year'] }.max
    data.each do |talk|
      %w[en it].each { |lang| refute_empty talk.fetch("title_#{lang}") }
      refute_match(/@|\||March:|September 4th/, talk['title_en'])
    end
  end

  def test_internal_links_never_use_external_arrows_including_hidden_spans
    site_host = URI(YAML.safe_load(File.read(File.expand_path('../_config.yml', __dir__)))['url']).host
    Dir.glob(File.join(ROOT, '**', '*.html')).each do |path|
      Nokogiri::HTML(File.read(path)).css('a[href]').each do |link|
        next unless link.text.include?('↗')
        href = link['href']
        uri = URI.parse(href)
        external = uri.scheme == 'mailto' || (%w[http https].include?(uri.scheme) || uri.host) && uri.host != site_host
        assert external, "#{path}: internal link #{href} uses ↗"
      end
    end
    %w[mailto:hey@jaack.me https://book.jaack.me/ https://www.linkedin.com/in/giacomobarbieri94/].each do |href|
      assert_includes doc('index.html').at_css("#contact a[href='#{href}']").text, '↗'
    end
  end

  def test_link_arrows_classify_hosts_rather_than_any_http_url
    { '/projects/carta/' => '→', 'https://jaack.me/about/' => '→', '//jaack.me/blog/' => '→',
      'https://other.example/path' => '↗', '//other.example/path' => '↗', 'mailto:hey@jaack.me' => '↗' }.each do |href, expected|
      html = render_post_fixture('{% include link-arrow.html href=page.href %}',
        'site' => { 'url' => 'https://jaack.me' }, 'page' => { 'href' => href })
      assert_equal expected, html.strip, href
    end
  end

  def test_default_pages_ship_scoped_structure_css_without_the_legacy_inline_sheet
    layout = File.read(File.expand_path('../_layouts/default.html', __dir__))
    refute_includes layout, 'critical-css.liquid'
    refute_includes layout, 'scssify'
    Dir.glob(File.join(ROOT, '**', '*.html')).each do |path|
      page = Nokogiri::HTML(File.read(path))
      next unless page.at_css('link[href="/assets/css/jaack-site.css"]')
      assert_equal 1, page.css('link[href="/assets/css/site-structure.css"]').length, path
      page.css('style').each { |style| refute_match(/normalize\.css v4|\.badge\.research/, style.text, path) }
    end
  end

  def test_every_post_has_a_unique_permalink_and_both_ipfs_guides_are_built
    site = Jekyll::Site.new(Jekyll.configuration('source' => File.expand_path('..', __dir__),
      'destination' => ROOT, 'quiet' => true))
    site.read
    duplicates = site.posts.docs.group_by(&:url).select { |_url, posts| posts.length > 1 }
      .transform_values { |posts| posts.map(&:relative_path) }
    assert_empty duplicates
    desktop = doc('installare-nodo-ipfs-desktop-en/index.html')
    vps = doc('installare-nodo-ipfs-en/index.html')
    assert_equal 'How to install an IPFS node', desktop.at_css('h1').text.strip
    assert_equal 'How to install an IPFS node on a VPS server', vps.at_css('h1').text.strip
    assert_includes desktop.at_css('.post-body').text, 'IPFS Desktop'
    assert_includes vps.at_css('.post-body').text, 'Ubuntu 18.04'
    assert_empty vps.css('main.post > .title-image')
    sitemap = Nokogiri::XML(File.read(File.join(ROOT, 'sitemap.xml'))).remove_namespaces!
    locations = sitemap.xpath('//url/loc').map { |loc| URI(loc.text).path }
    assert_equal locations.uniq, locations
    %w[/installare-nodo-ipfs-desktop-en/ /installare-nodo-ipfs-en/ /installare-nodo-ipfs/].each do |url|
      assert_equal 1, locations.count(url), url
    end
  end

  def test_ipfs_desktop_hreflang_is_reciprocal_and_does_not_pair_with_vps
    expected = { 'en' => 'https://jaack.me/installare-nodo-ipfs-desktop-en/',
      'it' => 'https://jaack.me/installare-nodo-ipfs/',
      'x-default' => 'https://jaack.me/installare-nodo-ipfs-desktop-en/' }
    %w[installare-nodo-ipfs-desktop-en/index.html installare-nodo-ipfs/index.html].each do |route|
      page = doc(route)
      assert_equal expected, page.css('head link[hreflang]').to_h { |link| [link['hreflang'], link['href']] }, route
      alternate = page.at_css('[data-alt-url]')['data-alt-url']
      assert_equal route.start_with?('installare-nodo-ipfs-desktop-en') ? '/installare-nodo-ipfs/' : '/installare-nodo-ipfs-desktop-en/', alternate
    end
    assert_empty doc('installare-nodo-ipfs-en/index.html').css('link[hreflang], [data-alt-url]')
  end

end
