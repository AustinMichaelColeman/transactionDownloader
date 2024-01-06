document.addEventListener("DOMContentLoaded", function () {
  handleClick("download-button", handleDownloadClick);
  handleClick("dismiss-button", clearErrorMessage);
});

function handleClick(elementId, callback) {
  const element = document.getElementById(elementId);
  element.addEventListener("click", callback);
}

function handleDownloadClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    if (isDownloadActivityPage(url)) {
      clearErrorMessage();
      sendDownloadMessageToTab(tabs[0].id);
    } else {
      showWrongPageError();
    }
  });
}

function isDownloadActivityPage(url) {
  return (
    url.startsWith("https://connect.secure.wellsfargo.com/") &&
    url.includes("download-account-activity")
  );
}

function sendDownloadMessageToTab(tabId) {
  chrome.tabs.sendMessage(tabId, {
    action: "downloadStatements",
  });
}

function showWrongPageError() {
  showError(
    "Wrong page. Navigate to the 'Download your account activity' page on Wells Fargo then try again."
  );
}

function showError(message) {
  var errorMessage = document.getElementById("error-message");
  var errorText = document.getElementById("error-text");
  errorText.textContent = message;
  errorMessage.classList.add("visible");
}

function clearErrorMessage() {
  var errorMessage = document.getElementById("error-message");
  errorMessage.classList.remove("visible");
}
