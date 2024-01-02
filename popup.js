document.addEventListener("DOMContentLoaded", function () {
  var downloadButton = document.getElementById("download-button");
  downloadButton.addEventListener(
    "click",
    function () {
      // Send a message to the content script with the date range and file format
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "downloadStatements",
        });
      });
    },
    false
  );
});
