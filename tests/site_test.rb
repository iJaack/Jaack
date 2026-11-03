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
      assert_equal 1, page.css('link[rel="canonical"]').length, route
      assert_match %r{\Ahttps://jaack.me/}, page.at_css('link[rel="canonical"]')['href'], route
      assert page.at_css('a[href="#main-content"]'), route
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
    assert_equal 3, page.css('.selected-writing article').length
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
    placeholder = carta.at_css('.app-monogram[aria-hidden="true"]')
    refute_nil placeholder
    assert_empty placeholder.inner_html
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
    assert_equal 6, work.css('.work-jumps a').length
    assert_equal 5, work.css('.app-grid .app-entry').length
    assert_equal %w[eva eva-protocol], work.css('.project-family .work-entry').map { |entry| entry['id'] }
    ids = work.css('[id]').map { |entry| entry['id'] }
    assert_equal ids.uniq, ids, 'Project anchors must remain unique'
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
    assert page.at_css('script[src*="beeline-button"]')
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

  def test_project_video_is_dormant_on_every_built_page
    paths = Dir.glob(File.join(ROOT, '**', '*.html'))
    refute_empty paths
    paths.each do |path|
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
      assert_equal %w[wide.webm wide.mp4 compact.webm compact.mp4].map { |s| path + s }, video.css('source').map { |s| s['src'] }
      assert_equal ['(min-width: 776px)', '(min-width: 776px)', nil, nil], video.css('source').map { |s| s['media'] }
      assert_equal %w[video/webm video/mp4 video/webm video/mp4], video.css('source').map { |s| s['type'] }

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

  def test_carta_has_a_native_development_preview_and_a_standard_project_entry
    page = doc('projects/carta/index.html')
    assert page.at_css('.project-page--carta')
    assert_equal 'Carta', page.at_css('h1').text
    figure = page.at_css('figure.project-art')
    refute_nil figure
    caption = figure.element_children.last
    assert_equal 'figcaption', caption.name
    assert_includes caption.at_css('.lang-en[lang="en"]').text, 'Development preview'
    assert_includes caption.at_css('.lang-en').text, 'sample text'
    assert_includes caption.at_css('.lang-en').text, 'native UI test harness'
    assert_includes caption.at_css('.lang-it[lang="it"]').text, 'Anteprima di sviluppo'
    assert_includes caption.at_css('.lang-it').text, 'testi di esempio'
    image = figure.at_css('img')
    assert_equal '/assets/images/work/carta/carta-publish-native-preview.png', image['src']
    assert_equal ['430', '932'], [image['width'], image['height']]
    assert_includes image['alt'], 'English Publish sheet with two sample posts'
    raster = File.binread(File.join(ROOT, image['src'].delete_prefix('/')))
    assert_equal [1290, 2796], raster.unpack('@16N2')
    assert_empty page.css('video, .project-video, script[src="/assets/js/project-video.js"]')
    refute_includes page.text, 'Dividi qui'
    refute_includes page.text, '29 characters over'
    assert page.at_css('.project-next a[href="mailto:hey@jaack.me?subject=Carta"]')
    assert page.at_css('a[href="/projects/#carta"]')
    entry = doc('projects/index.html').at_css('.app-grid #carta')
    assert entry.at_css('h3 a[href="/projects/carta/"]')
    refute entry.at_css('.app-icon, .app-monogram, .text-link')
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
      assert page.css("section.list.lang-#{lang} .item").length > 0
    end
    page.css('.reading-pick h3 a').each do |link|
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
    all_links = page.css('#all-notes .note-entry h3 a').map { |link| link['href'] }
    assert_equal 30, all_links.length
    assert_equal notes_by_url.keys.sort, all_links.sort
    dates = all_links.map { |url| DateTime.parse(notes_by_url.fetch(url)['date'].to_s) }
    assert_equal dates.sort.reverse, dates
    assert page.at_css('section#fitness')
    fitness_links = page.css('#fitness .note-entry h3 a').map { |link| link['href'] }
    assert_equal %w[/jun-7-th-2024-start/ /jun-7-th-2024-understanding-tp-numbers/ /jun-22-nd-2024-understanding-form-and-fatigue/ /aug-5-th-2024-in-search-of-the-complete-training-app/ /jan-13-th-2025-wrapping-up-2024/], fitness_links
    dates = fitness_links.map { |url| DateTime.parse(notes_by_url.fetch(url)['date'].to_s) }
    assert_equal dates.sort, dates
    tags = notes_by_url.values.flat_map { |data| data['tag'] }.uniq.sort
    assert_equal tags.map { |tag| "tag-#{tag}" }, page.css('section[id^="tag-"]').map { |section| section['id'] }
    tags.each do |tag|
      links = page.css("#tag-#{tag} .note-entry h3 a").map { |link| link['href'] }
      assert_equal all_links.select { |url| notes_by_url.fetch(url)['tag'].include?(tag) }, links
      assert page.at_css(".work-jumps a[href='#tag-#{tag}']"), tag
    end
    assert page.at_css('.work-jumps a[href="#fitness"]')
    page.css('.note-entry').each do |entry|
      data = notes_by_url.fetch(entry.at_css('h3 a')['href'])
      assert_equal DateTime.parse(data['date'].to_s).strftime('%F %T'), DateTime.parse(entry.at_css('time[datetime]')['datetime']).strftime('%F %T')
      assert_equal data['tag'], entry.css('.note-tag').map(&:text)
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
    refute_includes urls, 'https://jaack.me/en/about/'
    refute_includes urls, 'https://jaack.me/index'
    assert_equal 'https://jaack.me/about/', doc('en/about/index.html').at_css('link[rel="canonical"]')['href']
    assert_includes File.read(File.join(ROOT, 'robots.txt')), 'Sitemap: https://jaack.me/sitemap.xml'
  end
end
