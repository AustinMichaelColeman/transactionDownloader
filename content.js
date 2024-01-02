chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "downloadStatements") {
    downloadStatements(request.dateFrom, request.dateTo, request.fileFormat);
  }
});

async function downloadStatements() {
  await selectFileFormat();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  var dropdownToggle = document.querySelector('div[data-testid="Toggle"]');
  if (dropdownToggle) {
    dropdownToggle.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const accountCount = document
    .querySelector('ul[aria-label="Account"]')
    .querySelectorAll("li").length;

  for (let i = 0; i < accountCount; i++) {
    if (i !== 0) {
      var dropdownToggle = document.querySelector('div[data-testid="Toggle"]');
      dropdownToggle.click();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const accountList = document.querySelector('ul[aria-label="Account"]');
    const accounts = accountList.querySelectorAll("li");
    const account = accounts[i];
    account.click();
    try {
      await waitForElementToDisappear('div[data-testid="spinner"]');
    } catch (error) {
      console.error(error);
      continue; // Skip this iteration if the spinner doesn't disappear
    }
    const accountNameSpan = account.querySelector("span");
    const accountName = accountNameSpan.textContent
      .replace(/[^a-zA-Z0-9 \-_]/g, "")
      .trim();

    const fromDateValue = formatDateValue(
      document.getElementById("fromDate").value
    );
    const toDateValue = formatDateValue(
      document.getElementById("toDate").value
    );
    // Create a filename based on the account details and date range
    const fileName = `${toDateValue}_${fromDateValue}_${accountName}.csv`;
    console.log("filename", fileName);

    await clickDownload(fileName);

    try {
      await waitForElementToDisappear('div[data-testid="spinner"]');
    } catch (error) {
      console.error(error);
      continue; // Skip this iteration if the spinner doesn't disappear
    }
  }
}

function formatDateValue(date) {
  const [month, day, year] = date.split("/");
  return [year, month, day].join("-");
}

function waitForElementToDisappear(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    // Delay to allow for any immediate DOM updates
    setTimeout(() => {
      const intervalTime = 100; // How often to check for the disappearance in milliseconds
      let elapsedTime = 0; // Keep track of the elapsed time

      const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (!element) {
          clearInterval(interval);
          resolve();
        } else {
          elapsedTime += intervalTime;
          if (elapsedTime >= timeout) {
            clearInterval(interval);
            reject(new Error("Element did not disappear within timeout"));
          }
        }
      }, intervalTime);
    }, 500); // Initial delay before starting to check for the element
  });
}

// Example of an async function to select file format
async function selectFileFormat() {
  // Select file format
  document
    .querySelector('[data-testid="radio-fileFormat-commaDelimited"]')
    .click();
}

async function clickDownload(filename) {
  try {
    // Send a message to the background script to set up the expected filename
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "setFilename", filename },
        (response) => {
          if (chrome.runtime.lastError) {
            // Handle error, such as no background page listening
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            // Check for a specific response if necessary, otherwise just resolve
            resolve(response);
          }
        }
      );
    });

    // Assuming the response contains a status, check it
    if (response && response.status === "filename set") {
      document.querySelector('[data-testid="download-button"]').click();
    } else {
      // Handle the situation where the filename was not set
      throw new Error("Filename was not set.");
    }
  } catch (error) {
    console.error("Error setting filename:", error);
  }
}
