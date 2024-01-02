let expectedFilename = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if the message is from a script in your extension
  if (sender.id !== chrome.runtime.id) {
    return; // Not from your extension, ignore the message
  }

  if (message.action === "setFilename") {
    expectedFilename = message.filename;
    sendResponse({ status: "filename set" });
  }
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  if (
    expectedFilename &&
    downloadItem.url.startsWith("blob:https://connect.secure.wellsfargo.com/")
  ) {
    suggest({ filename: expectedFilename });
    expectedFilename = null; // Reset after suggesting the filename
  }
});
