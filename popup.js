// Execute when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for the copy button
  document.getElementById('copy-button').addEventListener('click', copyToClipboard);
  
  // Add the enhance button event listener
  document.getElementById('enhanceButton').addEventListener('click', enhancePrompt);
  
  // Add paste button functionality
  document.getElementById('paste-button').addEventListener('click', pasteFromClipboard);
  
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
  });
  
  enhancedPrompt.addEventListener('input', function() {
    autoResizeTextarea(this);
  });
  
  // Add smooth reveal animation on initial load
  document.querySelector('.app-container').style.opacity = '0';
  setTimeout(() => {
    document.querySelector('.app-container').style.opacity = '1';
    document.querySelector('.app-container').style.transition = 'opacity 0.5s ease';
  }, 100);
});

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

// Function to enhance prompts via Gemini API with simplified UI feedback and streaming effect
async function enhancePrompt() {
  const prompt = document.getElementById('promptInput').value;
  const enhancedPromptDiv = document.getElementById('enhancedPrompt');
  const enhanceButton = document.getElementById('enhanceButton');
  const buttonText = enhanceButton.querySelector('.button-text');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultContainer = document.querySelector('.result-container');

  // Check for empty prompt
  if (!prompt.trim()) {
    enhancedPromptDiv.value = "Please enter a prompt!";
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
                text: `Rephrase this prompt to be more detailed and clear: "${prompt}". Make to prompt only one way to rephrase. When outputting only give the rephrased version nothing else! Avoid any fancy formatting.
                To effectively prompt AI, first clearly define your goal by specifying the exact type of content needed, such as a blog post or email subject line. Next, indicate the desired return format for the response, whether it's bullet points, a paragraph, or another structure. Additionally, include any warnings or constraints, such as length limits, topics to exclude, or the need for accuracy checks. Finally, provide a "context dump" with relevant background details about your audience, brand tone, and overall objectives to ensure the AI's output aligns perfectly with your requirements.`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 100
        }
      })
    });

    const data = await response.json();

    // Check if the API returned a valid response
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const enhancedPrompt = data.candidates[0].content.parts[0].text;
      
      // Stream the text into the textarea with a typing effect
      await streamText(enhancedPromptDiv, enhancedPrompt);
    } else {
      enhancedPromptDiv.value = "Error: Could not enhance prompt. Try again.";
      autoResizeTextarea(enhancedPromptDiv);
    }
  } catch (error) {
    enhancedPromptDiv.value = "Error: Failed to connect to AI service.";
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

// Function to stream text with a typing effect
async function streamText(element, text) {
  element.value = '';
  const streamSpeed = 10; // milliseconds per character (adjust for faster/slower)
  
  for (let i = 0; i < text.length; i++) {
    element.value += text.charAt(i);
    autoResizeTextarea(element);
    await new Promise(resolve => setTimeout(resolve, streamSpeed));
  }
}

// Function to handle copying the enhanced prompt to clipboard with improved UI feedback
function copyToClipboard() {
  const enhancedPrompt = document.getElementById('enhancedPrompt').value;
  
  // Updated condition to check for specific error messages including "Please enter a prompt!"
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

// Add a CSS animation definition dynamically
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      50% { transform: translateX(5px); }
      75% { transform: translateX(-5px); }
    }
    
    @keyframes fadeOut {
      to { opacity: 0; transform: translateY(-20px) translateX(-50%); }
    }
    
    .shake {
      animation: shake 0.5s ease-in-out;
    }
    
    .error {
      border-left-color: #dc3545 !important;
    }
    
    .success {
      border-left-color: #28a745 !important;
    }
    
    .pulse {
      animation: pulse 1.5s infinite;
    }
    
    .loading {
      position: relative;
    }
  `;
  document.head.appendChild(style);
});