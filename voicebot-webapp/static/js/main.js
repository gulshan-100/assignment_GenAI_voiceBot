// Modern Chat Interface JavaScript
class VoiceBot {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.isProcessing = false;
        this.chatMessages = document.getElementById('chat-messages');
        this.manualInput = document.getElementById('manual-input');
        this.sendBtn = document.getElementById('send-btn');
        this.startBtn = document.getElementById('start-record-btn');
        this.stopBtn = document.getElementById('stop-record-btn');
        this.recordingIndicator = document.getElementById('recording-indicator');
        this.statusIndicator = document.getElementById('status-indicator');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.clearChatBtn = document.getElementById('clear-chat-btn');
        
        this.init();
    }

    init() {
        this.setupVoiceRecognition();
        this.setupEventListeners();
        this.updateStatus('Ready', 'success');
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            this.recognition.continuous = false;

            this.recognition.onstart = () => {
                this.isRecording = true;
                this.updateRecordingUI(true);
                this.updateStatus('Listening...', 'warning');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.addMessage(transcript, 'user');
                this.sendToServer(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.addMessage(`Error: ${event.error}`, 'bot');
                this.updateRecordingUI(false);
                this.updateStatus('Error occurred', 'danger');
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.updateRecordingUI(false);
                this.updateStatus('Ready', 'success');
            };
        } else {
            this.addMessage('Speech Recognition not supported in this browser. Please use the text input.', 'bot');
            this.startBtn.disabled = true;
            this.stopBtn.disabled = true;
        }
    }

    setupEventListeners() {
        // Voice controls
        this.startBtn.addEventListener('click', () => {
            if (this.recognition && !this.isRecording) {
                this.recognition.start();
            }
        });

        this.stopBtn.addEventListener('click', () => {
            if (this.recognition && this.isRecording) {
                this.recognition.stop();
            }
        });

        // Manual input
        this.sendBtn.addEventListener('click', () => {
            this.handleManualInput();
        });

        this.manualInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleManualInput();
            }
        });

        // Clear chat
        this.clearChatBtn.addEventListener('click', () => {
            this.clearChat();
        });

        // Auto-resize input
        this.manualInput.addEventListener('input', () => {
            this.manualInput.style.height = 'auto';
            this.manualInput.style.height = this.manualInput.scrollHeight + 'px';
        });
    }

    handleManualInput() {
        const text = this.manualInput.value.trim();
        if (text && !this.isProcessing) {
            this.addMessage(text, 'user');
            this.sendToServer(text);
            this.manualInput.value = '';
            this.manualInput.style.height = 'auto';
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="bi bi-person-fill"></i>' : '<i class="bi bi-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    async sendToServer(message) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading(true);
        this.updateStatus('Processing...', 'info');

        try {
            const response = await fetch('/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.addMessage(data.response, 'bot');
            this.speakText(data.response);
            
        } catch (error) {
            console.error('Error:', error);
            this.addMessage(`Sorry, I encountered an error: ${error.message}`, 'bot');
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
            this.updateStatus('Ready', 'success');
        }
    }

    speakText(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            utterance.onstart = () => {
                this.updateStatus('Speaking...', 'info');
            };
            
            utterance.onend = () => {
                this.updateStatus('Ready', 'success');
            };
            
            window.speechSynthesis.speak(utterance);
        }
    }

    updateRecordingUI(isRecording) {
        this.startBtn.disabled = isRecording;
        this.stopBtn.disabled = !isRecording;
        
        if (isRecording) {
            this.recordingIndicator.classList.add('active');
        } else {
            this.recordingIndicator.classList.remove('active');
        }
    }

    updateStatus(text, type) {
        const statusIcon = this.statusIndicator.querySelector('i');
        const statusText = this.statusIndicator.querySelector('span');
        
        statusText.textContent = text;
        statusIcon.className = `bi bi-circle-fill text-${type}`;
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.add('active');
        } else {
            this.loadingOverlay.classList.remove('active');
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    clearChat() {
        // Keep only the initial bot message
        const initialMessage = this.chatMessages.querySelector('.bot-message');
        this.chatMessages.innerHTML = '';
        if (initialMessage) {
            this.chatMessages.appendChild(initialMessage);
        }
        this.scrollToBottom();
    }
}

// Initialize the voice bot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceBot();
});

// Handle page visibility changes to pause/resume speech
document.addEventListener('visibilitychange', () => {
    if (document.hidden && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
    } else if (!document.hidden && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
    }
});