(function () {
  "use strict";

  function setInvalid(input, message) {
    input.setCustomValidity(message);
    input.reportValidity();
  }

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    var requiredInputs = form.querySelectorAll("input[required], select[required], textarea[required]");
    for (var i = 0; i < requiredInputs.length; i += 1) {
      var input = requiredInputs[i];
      if (!String(input.value || "").trim()) {
        event.preventDefault();
        setInvalid(input, "This field is required.");
        return;
      }
      input.setCustomValidity("");
    }
  });
})();
