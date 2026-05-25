(function () {
  "use strict";

  var chartRoot = document.getElementById("chart-root");
  if (!chartRoot) {
    return;
  }

  var bars = [62, 81, 74, 88, 79, 92, 86];
  var html = "<div style='display:flex;align-items:flex-end;gap:10px;height:220px;'>";

  for (var i = 0; i < bars.length; i += 1) {
    html += "<div title='" + bars[i] + "' style='width:32px;background:linear-gradient(180deg,#007a86,#00a0af);height:" + (bars[i] * 2) + "px;border-radius:8px 8px 0 0;'></div>";
  }

  html += "</div><p style='color:#4e5f75;margin-top:12px;'>Weekly operations performance trend</p>";
  chartRoot.innerHTML = html;
})();
