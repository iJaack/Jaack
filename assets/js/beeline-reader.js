var elements = document.querySelectorAll("");
for (var i = 0; i < elements.length; i++) {
  var beeline = new BeeLineReader(elements[i], {
    theme: ' night_blues',
    autoNightMode: true,
    skipBackgroundColor: true,
    customColor1: '#FFFFFF',
    customColor2: '#0000FF',
    customColor3: '#FFFFFF',
    customColor4: '#FF0500',
  });
  beeline.color();
}
