document.addEventListener("DOMContentLoaded", function () {
  const downloadButton = document.getElementById("download-button");
  downloadButton.addEventListener("click", handleDownloadClick);
});

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
  errorMessage.textContent = "Error: " + message;
  errorMessage.style.color = "red";
  errorMessage.style.display = "block"; // Show the element
}

function clearErrorMessage() {
  var errorMessage = document.getElementById("error-message");
  errorMessage.textContent = "";
  errorMessage.style.display = "none"; // Hide the element
}
