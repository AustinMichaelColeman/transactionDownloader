chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "downloadStatements") {
    downloadStatements(request.dateFrom, request.dateTo, request.fileFormat);
  }
});

async function downloadStatements() {
  await selectFileFormat();
  await delayForDOMUpdate();
  await clickDropdown();
  const accounts = getAccounts();

  for (let i = 0; i < accounts.length; i++) {
    if (i !== 0) {
      // skip first dropdown click, dropdown already open
      await clickDropdown();
    }
    // need to refresh accounts reference for clicking to work
    const accounts = getAccounts();
    const account = accounts[i];
    account.click();
    try {
      await waitForSpinnerToDisappear();
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

    await clickDownload(fileName);

    try {
      await waitForSpinnerToDisappear();
    } catch (error) {
      console.error(error);
      continue; // Skip this iteration if the spinner doesn't disappear
    }
  }
}

async function clickDropdown() {
  var dropdownToggle = document.querySelector('div[data-testid="Toggle"]');
  if (dropdownToggle) {
    dropdownToggle.click();
    await delayForDOMUpdate();
  }
}

function delayForDOMUpdate(duration = 1000) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

async function waitForSpinnerToDisappear() {
  await waitForElementToDisappear('div[data-testid="spinner"]');
}

function getAccounts() {
  return document
    .querySelector('ul[aria-label="Account"]')
    .querySelectorAll("li");
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
