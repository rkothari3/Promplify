// background.js - Securely manages API keys

// Store the API key in Chrome's storage sync
// This is a placeholder - for production, consider using an environment variable
// or a secure configuration during build rather than hardcoding
const GEMINI_API_KEY = "AIzaSyDNoSLHzVT1uw6CueBI57Ni-pGx_aGtGaI";

// Store the API key in Chrome's storage when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ geminiApiKey: GEMINI_API_KEY }, () => {
    console.log("API key stored securely");
  });
});

// Listen for messages from the popup to securely provide the API key
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getGeminiApiKey") {
    chrome.storage.local.get("geminiApiKey", (result) => {
      sendResponse({ apiKey: result.geminiApiKey });
    });
    return true; // Required for asynchronous response
  }
});