document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("json");
    const saveButton = document.getElementById("saveButton");

    // Load saved value from localStorage
    chrome.storage.local.get("popupInputValue", (data) => {
        if (data.popupInputValue) {
            userInput.value = data.popupInputValue;
        }
    });

    // Save input value to localStorage
    saveButton.addEventListener("click", () => {
        const value = userInput.value;
        chrome.storage.local.set({ popupInputValue: value }, () => {
            console.log("Input value saved:", value);
        });

        // Send the input value to content.js
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { message: value });
            }
        });
    });
});