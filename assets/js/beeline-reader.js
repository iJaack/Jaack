var elements = document.querySelectorAll(".color");
for (var i = 0; i < elements.length; i++) {
  var beeline = new BeeLineReader(elements[i], { theme: "bright" });
  beeline.color();
}
