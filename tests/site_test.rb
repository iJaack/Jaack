require 'minitest/autorun'
require 'nokogiri'
require 'uri'
require 'cgi'

class SiteTest < Minitest::Test
  ROOT = File.expand_path('../_site', __dir__)
  ROUTES = %w[index.html projects/index.html blog/index.html about/index.html now/index.html newsletter/index.html en/about/index.html 404.html]
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
    assert_equal 3, page.css('#selected-work article').length
    assert_equal 3, page.css('.selected-writing article').length
    assert page.at_css('#contact a[href^="mailto:"]')
    refute_includes page.text, 'Builder on the side'
  end

  def test_work_states_are_present_in_both_languages
    entries = doc('projects/index.html').css('.work-entry')
    assert_equal 13, entries.length
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
    refute_includes featured, '/projects/#routescan'
    assert_includes featured, '/projects/#eva-protocol'
    assert_includes work.at_css('#team1 .work-meta .lang-en').text, 'Italy Coordinator'
    assert_includes work.at_css('#redbridge .work-meta .lang-en').text, 'Active advisory'
    apps = work.css('section[aria-labelledby="group-apps"] .work-entry').map { |entry| entry['id'] }
    assert_equal %w[hundred parcelpilot pommidoro sea-temperature], apps.sort

    %w[about/index.html en/about/index.html].each do |route|
      page = doc(route)
      assert_includes page.at_css('.about-body .lang-en').text, 'I left in May 2026'
      assert_includes page.at_css('.about-body .lang-it').text, "Ho lasciato l'azienda"
    end
    bio = doc('acp-255-four-fee-curves-en/index.html').at_css('.author .bio').text
    assert_includes bio, 'Independent builder'
    assert_includes bio, 'Former Head of Growth at Routescan'
  end

  def test_archived_newsletter_does_not_collect_signups
    page = doc('newsletter/index.html')
    assert_empty page.css('form, input, iframe')
    assert_includes page.text, 'no longer published'
    refute_includes page.text, 'coming months'
  end

  def test_existing_special_pages_and_article_assets_survive
    %w[team1/index.html hundred/privacy/index.html hundred/support/index.html].each do |route|
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

  def test_build_does_not_publish_development_files
    %w[tests scripts Gemfile package.json vendor].each do |name|
      refute File.exist?(File.join(ROOT, name)), name
    end
  end
end
