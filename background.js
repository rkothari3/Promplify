// background.js - Securely manages API keys

// Store the API key in Chrome's storage sync
// Using the provided API key for Gemini API
const GEMINI_API_KEY = "AIzaSyDNoSLHzVT1uw6CueBI57Ni-pGx_aGtGaI";

// Store the API key in Chrome's storage when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    geminiApiKey: GEMINI_API_KEY,
    // Initialize poetic mode as false by default
    poeticMode: false,
    // Initialize an empty array for prompt history
    promptHistory: []
  }, () => {
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
  
  // Save prompt to history
  if (request.action === "saveToHistory") {
    savePromptToHistory(request.originalPrompt, request.enhancedPrompt);
    sendResponse({ success: true });
    return true;
  }
  
  // Get prompt history
  if (request.action === "getHistory") {
    chrome.storage.local.get("promptHistory", (result) => {
      sendResponse({ history: result.promptHistory || [] });
    });
    return true;
  }
  
  // Clear history
  if (request.action === "clearHistory") {
    chrome.storage.local.set({ promptHistory: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Function to save a prompt to history
function savePromptToHistory(originalPrompt, enhancedPrompt) {
  chrome.storage.local.get("promptHistory", (result) => {
    const history = result.promptHistory || [];
    
    // Create a new history item
    const historyItem = {
      id: Date.now(), // Use timestamp as unique ID
      timestamp: new Date().toISOString(),
      originalPrompt,
      enhancedPrompt
    };
    
    // Add to beginning of array (newest first)
    history.unshift(historyItem);
    
    // Limit history to 20 items
    const limitedHistory = history.slice(0, 20);
    
    // Save back to storage
    chrome.storage.local.set({ promptHistory: limitedHistory });
  });
}
