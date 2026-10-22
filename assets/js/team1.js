(function () {
  var search = document.getElementById('team1-search');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
  var daySections = Array.prototype.slice.call(document.querySelectorAll('.team1-day'));
  var slideCards = Array.prototype.slice.call(document.querySelectorAll('.slide-card'));
  var expandButtons = Array.prototype.slice.call(document.querySelectorAll('[data-expand]'));
  if (!search) return;
  var activeFilter = 'all';

  function applyFilters() {
    var query = (search.value || '').trim().toLowerCase();
    slideCards.forEach(function (card) {
      var haystack = (card.dataset.search || '').toLowerCase();
      var cardDay = card.dataset.day;
      var matchesDay = activeFilter === 'all' || cardDay === activeFilter;
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      card.hidden = !(matchesDay && matchesQuery);
    });
    daySections.forEach(function (section) {
      var sectionDay = section.dataset.day;
      var visibleCards = Array.prototype.some.call(section.querySelectorAll('.slide-card'), function (card) {
        return !card.hidden;
      });
      var matchesDay = activeFilter === 'all' || sectionDay === activeFilter;
      section.hidden = !(matchesDay && visibleCards);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filter;
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  search.addEventListener('input', applyFilters);

  expandButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var day = button.dataset.expand;
      document.querySelectorAll('.slide-card[data-day="' + day + '"]').forEach(function (card) {
        if (!card.hidden) card.open = true;
      });
    });
  });

  applyFilters();
})();
