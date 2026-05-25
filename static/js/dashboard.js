(function () {
  "use strict";

  var cards = document.querySelectorAll("[data-chart-value]");

  cards.forEach(function (node, index) {
    var target = Number(node.getAttribute("data-chart-value") || "0");
    var current = 0;
    var step = Math.max(1, Math.floor(target / 30));

    var timer = setInterval(function () {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      node.textContent = String(current);
    }, 16 + index * 4);
  });
})();
