document.addEventListener('DOMContentLoaded', () => {
    const messageArea = document.getElementById('messageArea');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const usernameForm = document.getElementById('usernameForm');
    const usernameInput = document.getElementById('username');

    const username = sessionStorage.getItem('username');

    if (username) {
        // User is already authenticated, show chat room
        showChatRoom();
    }

    usernameForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const usernameValue = usernameInput.value.trim();

        if (usernameValue) {
            sessionStorage.setItem('username', usernameValue);
            showChatRoom();
        } else {
            alert('Please enter a valid username.');
        }
    });

    function showChatRoom() {
        usernameForm.style.display = 'none';
        messageArea.style.display = 'block';
        messageForm.style.display = 'block';

        const socket = new WebSocket('ws://localhost:3000'); // Replace 'localhost:3000' with your server's WebSocket URL

        socket.addEventListener('open', () => {
            console.log('WebSocket connection established');
            socket.send(JSON.stringify({ type: 'username', username: username }));
        });

        socket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'chat') {
                displayMessage(message);
            }
        });

        messageForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const messageText = messageInput.value.trim();

            if (messageText) {
                socket.send(JSON.stringify({ type: 'chat', message: messageText }));
                messageInput.value = '';
            }
        });

        function displayMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            const senderElement = document.createElement('span');
            senderElement.classList.add('sender');
            senderElement.innerText = message.sender + ': ';
            const textElement = document.createElement('span');
            textElement.innerText = message.message;
            const timestampElement = document.createElement('span');
            timestampElement.classList.add('timestamp');
            timestampElement.innerText = ' (' + new Date(message.timestamp).toLocaleTimeString() + ')';
            
            messageElement.appendChild(senderElement);
            messageElement.appendChild(textElement);
            messageElement.appendChild(timestampElement);

            messageArea.appendChild(messageElement);
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    }
});