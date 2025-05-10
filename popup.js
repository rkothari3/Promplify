// Execute when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for the copy button
  document.getElementById('copy-button').addEventListener('click', copyToClipboard);
  
  // Add the enhance button event listener
  document.getElementById('enhanceButton').addEventListener('click', enhancePrompt);
  
  // Add paste button functionality
  document.getElementById('paste-button').addEventListener('click', pasteFromClipboard);
  
  // History feature event listeners
  document.getElementById('toggleHistory').addEventListener('click', toggleHistoryVisibility);
  document.getElementById('clearHistory').addEventListener('click', confirmClearHistory);
  
  // Easter egg: Add header click listener
  setupPoeticEasterEgg();
  
  // Add input field animation effects
  const promptInput = document.getElementById('promptInput');
  const enhancedPrompt = document.getElementById('enhancedPrompt');
  
  // Focus effect - add active class to parent for styling
  promptInput.addEventListener('focus', function() {
    this.parentElement.classList.add('active');
  });
  
  promptInput.addEventListener('blur', function() {
    this.parentElement.classList.remove('active');
  });
  
  // Auto-resize both textareas on load
  autoResizeTextarea(promptInput);
  autoResizeTextarea(enhancedPrompt);
  
  // Auto-resize textarea as user types for both textareas
  promptInput.addEventListener('input', function() {
    autoResizeTextarea(this);
    updateCounters(this, 'inputCounter');
  });
  
  enhancedPrompt.addEventListener('input', function() {
    autoResizeTextarea(this);
    updateCounters(this, 'enhancedCounter');
  });
  
  // Add smooth reveal animation on initial load
  document.querySelector('.app-container').style.opacity = '0';
  setTimeout(() => {
    document.querySelector('.app-container').style.opacity = '1';
    document.querySelector('.app-container').style.transition = 'opacity 0.5s ease';
  }, 100);
  
  // Initialize poetic state from storage
  chrome.storage.local.get('poeticMode', function(result) {
    if (result.poeticMode === true) {
      document.body.classList.add('poetic-mode');
      // Show poetic indicator in the footer
      document.getElementById('poeticIndicator').classList.remove('hidden');
      // Add decorative elements for poetic mode
      addPoeticDecorations();
    }
  });
  
  // Load history
  loadHistory();
  
  // Add token info tooltip
  addTokenInfoTooltip();
  
  // Initial counter update
  updateCounters(promptInput, 'inputCounter');
  updateCounters(enhancedPrompt, 'enhancedCounter');
});

// Setup the Poetic Easter Egg functionality
function setupPoeticEasterEgg() {
  const header = document.getElementById('headerTitle');
  let clickCount = 0;
  let lastClickTime = 0;
  const clickResetDelay = 3000; // 3 seconds to reset click counter
  
  // Create a hidden counter element
  const clickCounter = document.createElement('div');
  clickCounter.id = 'clickCounter';
  clickCounter.style.display = 'none';
  document.body.appendChild(clickCounter);
  
  header.addEventListener('click', function(e) {
    const currentTime = new Date().getTime();
    
    // Reset counter if too much time has passed since last click
    if (currentTime - lastClickTime > clickResetDelay) {
      clickCount = 0;
    }
    
    lastClickTime = currentTime;
    clickCount++;
    
    // Easter egg activation at 10 clicks
    if (clickCount === 10) {
      togglePoeticMode();
      clickCount = 0;
    } else if (clickCount > 5) {
      // Show hint animation when getting close
      const ripple = document.createElement('span');
      ripple.classList.add('header-ripple');
      
      // Position ripple at click location
      const rect = header.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      
      header.appendChild(ripple);
      
      // Show click feedback when getting close
      showClickFeedback(clickCount);
      
      // Remove ripple after animation completes
      setTimeout(() => ripple.remove(), 1000);
    }
  });
}

// Add decorative elements for poetic mode
function addPoeticDecorations() {
  // Add floating quill
  const quill = document.createElement('div');
  quill.innerHTML = '<i class="fas fa-feather-pointed"></i>';
  quill.className = 'floating-quill';
  document.body.appendChild(quill);
  
  // Add decorative flourishes to headers
  const headerElements = document.querySelectorAll('h1, h2');
  headerElements.forEach(header => {
    const flourish = document.createElement('div');
    flourish.className = 'flourish';
    header.parentNode.insertBefore(flourish, header.nextSibling);
  });
}

// Remove decorative elements
function removePoeticDecorations() {
  // Remove floating quill
  const quill = document.querySelector('.floating-quill');
  if (quill) quill.remove();
  
  // Remove decorative flourishes
  const flourishes = document.querySelectorAll('.flourish');
  flourishes.forEach(flourish => flourish.remove());
}

// Show visual feedback for click count
function showClickFeedback(count) {
  const clickCounter = document.getElementById('clickCounter');
  
  // Update and show counter
  clickCounter.textContent = `${count}/10`;
  clickCounter.style.display = 'block';
  
  // Add animation class
  clickCounter.classList.remove('pulse-animation');
  void clickCounter.offsetWidth; // Force reflow to restart animation
  clickCounter.classList.add('pulse-animation');
  
  // Hide counter after animation
  clearTimeout(clickCounter.hideTimeout);
  clickCounter.hideTimeout = setTimeout(() => {
    clickCounter.style.display = 'none';
  }, 1000);
}

// Function to toggle poetic mode with elegant effect
function togglePoeticMode() {
  const isPoeticMode = document.body.classList.toggle('poetic-mode');
  const poeticIndicator = document.getElementById('poeticIndicator');
  
  // Store poetic state in storage
  chrome.storage.local.set({ poeticMode: isPoeticMode });
  
  // Add elegant transition effect
  document.body.classList.add('elegant-transition');
  
  // Create transition overlay effect
  const overlay = document.createElement('div');
  overlay.classList.add('mode-transition-overlay');
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    document.body.classList.remove('elegant-transition');
    overlay.remove();
    
    if (isPoeticMode) {
      // Add poetic decorations
      addPoeticDecorations();
      poeticIndicator.classList.remove('hidden');
      showMessage('✨ Poetic mode activated ✨', 'success');
      playPoeticSound();
    } else {
      // Remove poetic decorations
      removePoeticDecorations();
      poeticIndicator.classList.add('hidden');
      showMessage('Poetic mode deactivated', 'success');
    }
  }, 800);
}

// Play a gentle visual effect when poetic mode is activated (no sound)
function playPoeticSound() {
  // Visual feedback only - no sound effects
  const overlay = document.createElement('div');
  overlay.classList.add('poetic-activation');
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    overlay.remove();
  }, 1000);
}

// Function to handle copying the enhanced prompt to clipboard with improved UI feedback
function copyToClipboard() {
  const enhancedPrompt = document.getElementById('enhancedPrompt').value;
  
  // Check if there's anything to copy
  if (!enhancedPrompt || 
      enhancedPrompt === "Enhancing..." || 
      enhancedPrompt.startsWith("Error:") || 
      enhancedPrompt === "Please enter a prompt!") {
    
    showMessage('Nothing to copy. Please enhance a prompt first.', 'error');
    
    // Add shake animation to copy button for feedback
    const copyButton = document.getElementById('copy-button');
    copyButton.classList.add('shake');
    setTimeout(() => copyButton.classList.remove('shake'), 500);
    return;
  }
  
  navigator.clipboard.writeText(enhancedPrompt)
    .then(() => {
      showMessage('Copied to clipboard!', 'success');
      
      // Visual feedback on the copy button
      const copyButton = document.getElementById('copy-button');
      copyButton.innerHTML = '<i class="fas fa-check fa-sm"></i> Copied!';
      copyButton.classList.add('copied');
      
      // Reset button text after 2 seconds
      setTimeout(() => {
        copyButton.innerHTML = '<i class="fas fa-copy fa-sm"></i> Copy';
        copyButton.classList.remove('copied');
      }, 2000);
    })
    .catch(err => {
      showMessage('Failed to copy text: ' + err, 'error');
    });
}

// Function to paste text from clipboard with better error handling
async function pasteFromClipboard() {
  const pasteButton = document.getElementById('paste-button');
  
  // Add loading state to button
  const originalText = pasteButton.innerHTML;
  pasteButton.innerHTML = '<i class="fas fa-spinner fa-spin fa-sm"></i> Pasting...';
  
  try {
    // Check if clipboard-read permission is available in this context
    if (navigator.clipboard) {
      const text = await navigator.clipboard.readText();
      const promptInput = document.getElementById('promptInput');
      promptInput.value = text;
      
      // Auto resize the textarea
      autoResizeTextarea(promptInput);
      
      // Update the counter for the pasted text
      updateCounters(promptInput, 'inputCounter');
      
      // Success feedback
      pasteButton.innerHTML = '<i class="fas fa-check fa-sm"></i> Pasted!';
      pasteButton.classList.add('success');
      showMessage('Text pasted from clipboard', 'success');
      
      // Reset button after delay
      setTimeout(() => {
        pasteButton.innerHTML = originalText;
        pasteButton.classList.remove('success');
      }, 2000);
    } else {
      // Clipboard API not available in this context
      pasteButton.innerHTML = originalText;
      showMessage('Please use Ctrl+V to paste text', 'error');
    }
  } catch (err) {
    console.error('Clipboard error:', err);
    pasteButton.innerHTML = originalText;
    // More user-friendly message
    showMessage('Please use Ctrl+V to paste text', 'error');
  }
}

// Function to enhance prompts via Gemini API with simplified UI feedback and streaming effect
async function enhancePrompt() {
  const prompt = document.getElementById('promptInput').value;
  const enhancedPromptDiv = document.getElementById('enhancedPrompt');
  const enhanceButton = document.getElementById('enhanceButton');
  const buttonText = enhanceButton.querySelector('.button-text');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultContainer = document.querySelector('.result-container');
  const isPoeticMode = document.body.classList.contains('poetic-mode');

  // Check for empty prompt
  if (!prompt.trim()) {
    enhancedPromptDiv.value = isPoeticMode ? 
      "O empty canvas, awaiting the muse's touch! Please inscribe thy thoughts before seeking enhancement." : 
      "Please enter a prompt!";
    autoResizeTextarea(enhancedPromptDiv);
    
    // Shake animation for error
    resultContainer.classList.add('shake');
    setTimeout(() => resultContainer.classList.remove('shake'), 500);
    return;
  }

  // Reset any error state
  enhancedPromptDiv.classList.remove('error');
  
  // Show loading state with simpler feedback
  enhancedPromptDiv.value = "";
  enhanceButton.classList.add('loading');
  buttonText.style.visibility = 'hidden';
  loadingSpinner.style.display = 'block';
  
  // Add subtle pulse to result box during loading
  resultContainer.classList.add('pulse');

  try {
    // Get API key securely
    const apiKey = await getGeminiApiKey();
    
    // Generate appropriate prompt based on mode
    let promptTemplate;
    if (isPoeticMode) {
      promptTemplate = `Transform the following prompt into a beautifully poetic and literary version, using elegant language, literary devices, and vivid imagery. Make it sound like it was written by a master poet while keeping the original intent intact. The result should be sophisticated, flowing, and artistic. 

Original prompt: "${prompt}"

Please provide only the transformed poetic version without any explanations or comments.`;
    } else {
      promptTemplate = `Rephrase this prompt to be more detailed and clear: "${prompt}". Make the prompt only one way to rephrase. When outputting only give the rephrased version nothing else! Avoid any fancy formatting.
      To effectively prompt AI, first clearly define your goal by specifying the exact type of content needed, such as a blog post or email subject line. Next, indicate the desired return format for the response, whether it's bullet points, a paragraph, or another structure. Additionally, include any warnings or constraints, such as length limits, topics to exclude, or the need for accuracy checks. Finally, provide a "context dump" with relevant background details about your audience, brand tone, and overall objectives to ensure the AI's output aligns perfectly with your requirements.`;
    }
    
    // Call Gemini API with the securely retrieved API key
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptTemplate
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150, // Consistent for both modes
          temperature: isPoeticMode ? 0.8 : 0.2 // More creative for poetic mode
        }
      })
    });

    const data = await response.json();

    // Check if the API returned a valid response
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const enhancedPrompt = data.candidates[0].content.parts[0].text;
      
      // Stream the text into the textarea with a typing effect
      await streamText(enhancedPromptDiv, enhancedPrompt, isPoeticMode);
      
      // Update the counter for enhanced prompt
      updateCounters(enhancedPromptDiv, 'enhancedCounter');
      
      // Save to history
      savePromptToHistory(prompt, enhancedPrompt);
      
      // Reload history list with new entry
      loadHistory();
    } else {
      enhancedPromptDiv.value = isPoeticMode 
        ? "Alas! The muse refuses to sing. Perhaps try once more, with feeling..." 
        : "Error: Could not enhance prompt. Try again.";
      autoResizeTextarea(enhancedPromptDiv);
    }
  } catch (error) {
    enhancedPromptDiv.value = isPoeticMode 
      ? "The ethereal connection to the poetic realm has been severed. Pray, try again when the stars align." 
      : "Error: Failed to connect to AI service.";
    autoResizeTextarea(enhancedPromptDiv);
    console.error(error);
  } finally {
    // Remove loading states
    enhanceButton.classList.remove('loading');
    buttonText.style.visibility = 'visible';
    loadingSpinner.style.display = 'none';
    resultContainer.classList.remove('pulse');
  }
}

// Function to save a prompt to history
function savePromptToHistory(originalPrompt, enhancedPrompt) {
  chrome.runtime.sendMessage({
    action: "saveToHistory",
    originalPrompt,
    enhancedPrompt
  });
}

// Function to load history from storage
function loadHistory() {
  chrome.runtime.sendMessage({ action: "getHistory" }, (response) => {
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    
    // Clear the current list
    historyList.innerHTML = '';
    
    if (response.history && response.history.length > 0) {
      // Hide the empty message
      emptyHistory.classList.remove('visible');
      
      // Add each history item
      response.history.forEach(item => {
        const historyItem = createHistoryItem(item);
        historyList.appendChild(historyItem);
      });
    } else {
      // Show empty message
      emptyHistory.classList.add('visible');
    }
  });
}

// Function to create a history item element
function createHistoryItem(item) {
  const historyItem = document.createElement('div');
  historyItem.className = 'history-item';
  historyItem.dataset.id = item.id;
  
  // Format the timestamp
  const date = new Date(item.timestamp);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  // Calculate token counts for display
  const originalTokens = estimateTokenCount(item.originalPrompt);
  const enhancedTokens = estimateTokenCount(item.enhancedPrompt);
  
  // Truncate the prompt text
  const truncatedPrompt = item.originalPrompt.length > 60 
    ? item.originalPrompt.substring(0, 60) + '...' 
    : item.originalPrompt;
  
  historyItem.innerHTML = `
    <div class="history-prompt">${truncatedPrompt}</div>
    <div class="history-timestamp">
      <i class="fas fa-clock fa-xs"></i> ${formattedDate}
      <span class="history-tokens">
        <i class="fas fa-exchange-alt fa-xs"></i> ~${originalTokens}→${enhancedTokens}
      </span>
    </div>
    <div class="history-actions-row">
      <button class="history-button use-original">Use Original</button>
      <button class="history-button use-enhanced">Use Enhanced</button>
    </div>
  `;
  
  // Add event listeners for buttons
  historyItem.querySelector('.use-original').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('promptInput').value = item.originalPrompt;
    autoResizeTextarea(document.getElementById('promptInput'));
    updateCounters(document.getElementById('promptInput'), 'inputCounter');
  });
  
  historyItem.querySelector('.use-enhanced').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('enhancedPrompt').value = item.enhancedPrompt;
    autoResizeTextarea(document.getElementById('enhancedPrompt'));
    updateCounters(document.getElementById('enhancedPrompt'), 'enhancedCounter');
  });
  
  // Click on the item to expand/view details
  historyItem.addEventListener('click', () => {
    showHistoryItemDetails(item);
  });
  
  return historyItem;
}

// Function to show history item details
function showHistoryItemDetails(item) {
  const isPoeticMode = document.body.classList.contains('poetic-mode');
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  
  dialog.innerHTML = `
    <div class="dialog-title">Prompt History</div>
    <div class="dialog-message">
      <p><strong>Original Prompt:</strong></p>
      <p class="dialog-prompt">${item.originalPrompt}</p>
      <p><strong>Enhanced Prompt:</strong></p>
      <p class="dialog-prompt">${item.enhancedPrompt}</p>
      <p class="dialog-timestamp"><em>${new Date(item.timestamp).toLocaleString()}</em></p>
    </div>
    <div class="dialog-buttons">
      <button class="dialog-button dialog-button-cancel">Close</button>
    </div>
  `;
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  
  // Add to DOM
  document.body.appendChild(backdrop);
  document.body.appendChild(dialog);
  
  // Apply poetic mode styling if needed
  if (isPoeticMode) {
    dialog.style.backgroundColor = '#faf7ef';
    dialog.style.borderColor = '#d3c6b2';
  }
  
  // Close dialog on button click or backdrop click
  dialog.querySelector('.dialog-button-cancel').addEventListener('click', () => {
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });
  
  backdrop.addEventListener('click', () => {
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });
}

// Function to toggle history list visibility
function toggleHistoryVisibility() {
  const historyList = document.getElementById('historyList');
  const toggleIcon = document.getElementById('toggleHistory').querySelector('i');
  
  historyList.classList.toggle('collapsed');
  
  if (historyList.classList.contains('collapsed')) {
    toggleIcon.className = 'fas fa-angle-up';
  } else {
    toggleIcon.className = 'fas fa-angle-down';
  }
}

// Function to confirm clearing the history
function confirmClearHistory() {
  const isPoeticMode = document.body.classList.contains('poetic-mode');
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  
  dialog.innerHTML = `
    <div class="dialog-title">${isPoeticMode ? 'Erase the Scrolls?' : 'Clear History?'}</div>
    <div class="dialog-message">
      ${isPoeticMode 
        ? 'Art thou certain thou wishest to erase all records of thy past creative endeavors? This action cannot be undone.' 
        : 'Are you sure you want to clear all history? This action cannot be undone.'}
    </div>
    <div class="dialog-buttons">
      <button class="dialog-button dialog-button-cancel">Cancel</button>
      <button class="dialog-button dialog-button-confirm">Clear</button>
    </div>
  `;
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  
  // Add to DOM
  document.body.appendChild(backdrop);
  document.body.appendChild(dialog);
  
  // Apply poetic mode styling if needed
  if (isPoeticMode) {
    dialog.style.backgroundColor = '#faf7ef';
    dialog.style.borderColor = '#d3c6b2';
  }
  
  // Close dialog on cancel or backdrop click
  dialog.querySelector('.dialog-button-cancel').addEventListener('click', () => {
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });
  
  backdrop.addEventListener('click', () => {
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });
  
  // Clear history on confirm
  dialog.querySelector('.dialog-button-confirm').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "clearHistory" }, (response) => {
      if (response.success) {
        loadHistory();
        showMessage(isPoeticMode ? 'Thy scrolls have been cleared' : 'History cleared', 'success');
      }
    });
    document.body.removeChild(dialog);
    document.body.removeChild(backdrop);
  });
}

// Function to get the API key securely from the background script
async function getGeminiApiKey() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getGeminiApiKey" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (response && response.apiKey) {
        resolve(response.apiKey);
      } else {
        reject(new Error("Failed to retrieve API key"));
      }
    });
  });
}

// Function to stream text with a typing effect - with poetic mode support
async function streamText(element, text, isPoeticMode) {
  element.value = '';
  
  // Poetic mode types with more dramatic pauses and varied speeds
  const baseSpeed = isPoeticMode ? 15 : 10; // slower for poetic mode to be more dramatic
  
  for (let i = 0; i < text.length; i++) {
    element.value += text.charAt(i);
    autoResizeTextarea(element);
    
    // Update counter periodically (not on every character to avoid excessive updates)
    if (i % 10 === 0 || i === text.length - 1) {
      const counterId = element.id === 'promptInput' ? 'inputCounter' : 'enhancedCounter';
      updateCounters(element, counterId);
    }
    
    // Add dramatic pauses for poetic mode at punctuation
    let delay = baseSpeed;
    if (isPoeticMode) {
      if (['.', ',', ';', '!', '?'].includes(text.charAt(i))) {
        delay = baseSpeed * 3; // Longer pause at punctuation
      } else if (text.charAt(i) === '\n') {
        delay = baseSpeed * 5; // Even longer pause at line breaks
      } else {
        // Slightly randomized typing for poetic effect
        delay = baseSpeed + (Math.random() * 10 - 5);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Final counter update to ensure accuracy
  const counterId = element.id === 'promptInput' ? 'inputCounter' : 'enhancedCounter';
  updateCounters(element, counterId);
}

// Function to show user messages with enhanced animation
function showMessage(message, type) {
  const messageElement = document.getElementById('message') || createMessageElement();
  messageElement.textContent = message;
  messageElement.className = `message ${type}`;
  
  // Add appropriate icon to message
  const iconClass = type === 'success' ? 'check-circle' : 'exclamation-circle';
  messageElement.innerHTML = `<i class="fas fa-${iconClass} fa-sm"></i> ${message}`;
  
  // Display with animation
  messageElement.style.display = 'block';
  messageElement.style.animation = 'slideDown 0.3s ease-out, fadeOut 0.5s ease-out 2.5s forwards';
  
  // Hide message after animation completes
  setTimeout(() => {
    messageElement.style.display = 'none';
    messageElement.style.animation = '';
  }, 3000);
}

// Helper function to create message element if it doesn't exist
function createMessageElement() {
  const messageElement = document.createElement('div');
  messageElement.id = 'message';
  document.body.appendChild(messageElement);
  return messageElement;
}

// Function to automatically resize textareas based on content
function autoResizeTextarea(textarea) {
  if (!textarea) return;
  
  // Reset height first to get the correct scrollHeight
  textarea.style.height = 'auto';
  
  // Calculate new height (with min and max constraints)
  const minHeight = 80; // Minimum height
  const maxHeight = 200; // Maximum height
  const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
  
  // Apply the new height
  textarea.style.height = newHeight + 'px';
}

// Add token info tooltip to help explain what tokens are
function addTokenInfoTooltip() {
  const inputCounter = document.getElementById('inputCounter');
  const enhancedCounter = document.getElementById('enhancedCounter');
  
  // Add tooltip to both counters
  [inputCounter, enhancedCounter].forEach(counter => {
    const tokenCount = counter.querySelector('.token-count');
    const infoSpan = document.createElement('span');
    infoSpan.className = 'token-info';
    
    const tooltipText = document.createElement('span');
    tooltipText.className = 'tooltip-text';
    tooltipText.textContent = 'Tokens are how AI models process text. Most models use roughly 4 characters per token, but this varies based on language, symbols, and spacing. This is an estimate.';
    
    infoSpan.appendChild(tooltipText);
    tokenCount.appendChild(infoSpan);
  });
}

// Function to update character and token counters
function updateCounters(textarea, counterElementId) {
  if (!textarea || !counterElementId) return;
  
  const text = textarea.value;
  const charCount = text.length;
  const tokenCount = estimateTokenCount(text);
  
  const counterContainer = document.getElementById(counterElementId);
  const charCountElement = counterContainer.querySelector('.char-count');
  const tokenCountElement = counterContainer.querySelector('.token-count');
  
  // Update the counter text
  charCountElement.textContent = `${charCount} chars`;
  tokenCountElement.textContent = `~${tokenCount} tokens`;
  
  // Reset classes first
  charCountElement.classList.remove('counter-warning', 'counter-danger');
  tokenCountElement.classList.remove('counter-warning', 'counter-danger');
  
  // Add warning classes based on token counts
  // Most models have 2048 or 4096 token limits, but we'll warn at lower thresholds
  if (tokenCount > 1500) {
    tokenCountElement.classList.add('counter-danger');
  } else if (tokenCount > 1000) {
    tokenCountElement.classList.add('counter-warning');
  }
  
  // Add character count warnings at high lengths
  if (charCount > 6000) {
    charCountElement.classList.add('counter-danger');
  } else if (charCount > 4000) {
    charCountElement.classList.add('counter-warning');
  }
}

// Function to estimate token count from text
// This is a simple approximation - actual tokenization varies by model
function estimateTokenCount(text) {
  if (!text) return 0;
  
  // Basic estimation: average English text is roughly 4 characters per token
  // More sophisticated estimation would use regex to count words, punctuation, etc.
  // For a simple approximation:
  
  // Count words (separated by spaces)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  
  // Count special characters and punctuation
  const specialChars = text.match(/[^\w\s]/g) || [];
  const specialCharCount = specialChars.length;
  
  // Count numbers (digits are often their own tokens)
  const numberGroups = text.match(/\d+/g) || [];
  const numberCount = numberGroups.reduce((sum, group) => sum + Math.ceil(group.length / 2), 0);
  
  // Calculate estimated token count
  let estimatedTokens = wordCount;          // Each word is roughly one token
  estimatedTokens += specialCharCount * 0.5; // Special chars often share tokens
  estimatedTokens += numberCount;            // Number groups
  estimatedTokens += 2;                      // Add a small buffer
  
  // Ensure reasonable minimum based on character count
  const minTokensByChars = Math.ceil(text.length / 4); // ~4 chars per token
  
  // Return the higher of our two estimates, rounded to nearest whole number
  return Math.max(Math.round(estimatedTokens), minTokensByChars);
}