let conversations = [];
        let currentConversationId = null;
        let messageHistory = [];
        let sidebarVisible = true;

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const toggleBtn = document.getElementById('toggleBtn');
            sidebarVisible = !sidebarVisible;
            
            if (sidebarVisible) {
                sidebar.classList.remove('hidden');
                toggleBtn.textContent = '☰';
            } else {
                sidebar.classList.add('hidden');
                toggleBtn.textContent = '☰';
            }
        }

        function loadData() {
            const saved = conversations;
            if (saved.length > 0) {
                conversations = saved;
                renderHistory();
                if (currentConversationId) {
                    loadConversation(currentConversationId);
                }
            }
        }

        function saveData() {
        }

        function startNewChat() {
            currentConversationId = Date.now();
            messageHistory = [];
            const chatContainer = document.getElementById('chatContainer');
            chatContainer.innerHTML = `
                <div class="welcome-screen" id="welcomeScreen">
                    <h1>🤖 How can i assist you?</h1>
                    <p>Start a conversation by typing your message below...</p>
                </div>
            `;
            document.getElementById('userInput').focus();
            document.querySelectorAll('.history-item').forEach(item => {
                item.classList.remove('active');
            });
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        async function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            
            if (!message) return;
            if (!currentConversationId) {
                currentConversationId = Date.now();
            }

            const welcomeScreen = document.getElementById('welcomeScreen');
            if (welcomeScreen) {
                welcomeScreen.remove();
            }

            addMessage(message, 'user');
            messageHistory.push({ role: 'user', content: message });
            input.value = '';

            showTypingIndicator();
            setTimeout(() => {
                const response = generateAIResponse(message);
                removeTypingIndicator();
                addMessage(response, 'ai');
                messageHistory.push({ role: 'ai', content: response });
                
                saveConversation();
            }, 1500);
        }

        function addMessage(content, type) {
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}-message`;
            
            messageDiv.innerHTML = `
                <div class="message-avatar ${type}-avatar">
                    ${type === 'user' ? '👤' : '🤖'}
                </div>
                <div class="message-content">${content}</div>
            `;
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function showTypingIndicator() {
            const chatContainer = document.getElementById('chatContainer');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message ai-message';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = `
                <div class="message-avatar ai-avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
            chatContainer.appendChild(typingDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function removeTypingIndicator() {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) indicator.remove();
        }

        function generateAIResponse(userMessage) {
            const responses = {
                'test': 'bacot'
            };

            const lowerMessage = userMessage.toLowerCase();
            
            for (let key in responses) {
                if (lowerMessage.includes(key)) {
                    return responses[key];
                }
            }
        }

        function saveConversation() {
            if (messageHistory.length === 0) return;

            const existingIndex = conversations.findIndex(c => c.id === currentConversationId);
            
            const conversation = {
                id: currentConversationId,
                title: messageHistory[0].content.substring(0, 30) + '...',
                preview: messageHistory[messageHistory.length - 1].content.substring(0, 50) + '...',
                messages: [...messageHistory],
                timestamp: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                conversations[existingIndex] = conversation;
            } else {
                conversations.unshift(conversation);
            }

            saveData();
            renderHistory();
        }

        function renderHistory() {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '';

            conversations.forEach(conv => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                if (conv.id === currentConversationId) {
                    historyItem.classList.add('active');
                }
                
                historyItem.innerHTML = `
                    <div class="history-content" onclick="loadConversation(${conv.id})">
                        <div class="history-title">${conv.title}</div>
                        <div class="history-preview">${conv.preview}</div>
                    </div>
                    <div class="history-actions">
                        <button class="delete-btn" onclick="deleteConversation(${conv.id}, event)">🗑️</button>
                    </div>
                `;
                
                historyList.appendChild(historyItem);
            });
        }

        function deleteConversation(id, event) {
            event.stopPropagation();
            
            if (confirm('Are you sure you want to delete this conversation?')) {
                conversations = conversations.filter(c => c.id !== id);
                
                if (currentConversationId === id) {
                    startNewChat();
                }
                
                saveData();
                renderHistory();
            }
        }

        function loadConversation(id) {
            const conversation = conversations.find(c => c.id === id);
            if (!conversation) return;

            currentConversationId = id;
            messageHistory = [...conversation.messages];

            const chatContainer = document.getElementById('chatContainer');
            chatContainer.innerHTML = '';

            messageHistory.forEach(msg => {
                addMessage(msg.content, msg.role);
            });

            renderHistory();
        }

        // Initialize
        loadData();