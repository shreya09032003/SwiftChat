const socket = io('http://localhost:3000');
let name;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message_area');
let typingIndicator = document.createElement('div');
typingIndicator.classList.add('typing-indicator');


// Prompt user for name
do {
    name = prompt('Please enter your name');
} while (!name);
console.log(name);

// Event listener for typing in textarea
textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage(e.target.value);
        clearFilePreview(); // Clear file preview after sending message
        socket.emit('stop typing', name);
    } else {
        socket.emit('typing', name);
        setTimeout(() => {
            socket.emit('stop typing', name);
        }, 1000);
    }
});

// Event listener for textarea blur (focus lost)
textarea.addEventListener('blur', () => {
    socket.emit('stop typing', name);
});

// Function to send a message
function sendMessage(message) {
    let msg = {
        user: name,
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString()
    };
    appendMessage(msg, 'outgoing');
    textarea.value = '';
    scrollToBottom();
    socket.emit('message', msg);
    socket.emit('stop typing', name);  // Ensure typing stops after sending a message
}

// Function to append a message to the chat area
function appendMessage(msg, type) {
    let messageContainer = document.createElement('div');
    messageContainer.classList.add('message');

    let className = type === 'outgoing' ? 'outgoing' : 'incoming';
    messageContainer.classList.add(className);

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
        <div class="timestamp">${msg.timestamp}</div>
    `;
    messageContainer.innerHTML = markup;

    messageArea.appendChild(messageContainer);
    scrollToBottom();
}

// Socket event listener for receiving messages
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming');
});

// Socket event listener for typing indicator
socket.on('typing', (user) => {
    showTypingIndicator(user);
});

// Socket event listener for stopping typing indicator
socket.on('stop typing', () => {
    hideTypingIndicator();
});

// Function to display typing indicator
function showTypingIndicator(user) {
    typingIndicator.innerText = `${user} is typing...`; // Update text with user's name
    if (!document.querySelector('.typing-indicator')) {
        messageArea.appendChild(typingIndicator);
    }
}

// Function to hide typing indicator
function hideTypingIndicator() {
    let indicator = document.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Function to scroll to the bottom of the chat area
function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

// File input element and send file button
const fileInput = document.querySelector('#fileInput');
const sendFileButton = document.querySelector('#sendFileButton');
const previewContainer = document.querySelector('#previewContainer');



// Function to send file
function sendFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const fileData = e.target.result;
        const fileInfo = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: fileData,
            user: name,
            timestamp: new Date().toLocaleTimeString()
        };
        // Emit file to server
        socket.emit('file', fileInfo);
    };
    reader.readAsDataURL(file); // Read file as data URL (base64)
}
// Event listener for file input change
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = {
                fileName: file.name,
                fileType: file.type,
                data: e.target.result,
                user: name, // Replace with actual user name or identifier
                timestamp: new Date().toLocaleTimeString()
            };
            //socket.emit('file-upload', fileData);
        };
        reader.readAsDataURL(file);
    }
});

// Event listener for send file button
sendFileButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = {
                fileName: file.name,
                fileType: file.type,
                data: e.target.result,
                user: name,
                timestamp: new Date().toLocaleTimeString()
            };
            socket.emit('file-upload', fileData); // Emit file data to server
            appendFileMessage({ user: 'You', fileData: fileData, timestamp: fileData.timestamp }, 'outgoing');
            clearFileInputAndPreview(); // Clear file input and preview after sending
            scrollToBottom();
        };
        reader.readAsDataURL(file);
    }
});

// Function to append file message to the chat area
function appendFileMessage(fileMessage, type) {
    let messageContainer = document.createElement('div');
    messageContainer.classList.add('message');

    let className = type === 'outgoing' ? 'outgoing' : 'incoming';
    messageContainer.classList.add(className);

    let markup = `
        <h4>${fileMessage.user}</h4>
        <p>
            <img src="${fileMessage.fileData.data}" alt="${fileMessage.fileData.fileName}" style="max-width: 200px;">
            <br>
            
        </p>
        <div class="timestamp">${fileMessage.timestamp}</div>
    `;
    messageContainer.innerHTML = markup;

    messageArea.appendChild(messageContainer);
    scrollToBottom();
}

// Socket event listener for receiving file data

// Function to receive and display a file message
// Function to receive and display a file message
function receiveFile(fileInfo) {
    let messageContainer = document.createElement('div');
    messageContainer.classList.add('message', 'incoming');

    let fileMarkup = `
        <h4>${fileInfo.user}</h4>
        <img src="${fileInfo.data}" alt="${fileInfo.fileName}" style="max-width: 200px;">
        <p>
            <a href="${fileInfo.data}" download="${fileInfo.fileName}" title="Download">
                <i class="fas fa-download"></i>
            </a>
        </p>
        <div class="timestamp">${fileInfo.timestamp}</div>
    `;
    messageContainer.innerHTML = fileMarkup;

    messageArea.appendChild(messageContainer);
    scrollToBottom();
}

// Socket event listener for receiving file data
socket.on('file-upload', (fileInfo) => {
    receiveFile(fileInfo);
});

// Theme toggle functionality
const themeToggle = document.querySelector('#themeToggle');
const body = document.body;

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
});

// Function to preview selected file
function previewFile() {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 100; // Adjust this width as needed for your preview size
                canvas.height = 100; // Adjust this height as needed for your preview size
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                previewContainer.innerHTML = `<img src="${canvas.toDataURL()}" alt="${file.name}" style="max-width: 200px;">`;
            };
        };
        reader.readAsDataURL(file);
    } else {
        clearFilePreview();
    }
}

// Function to clear file preview
function clearFilePreview() {
    previewContainer.innerHTML = ''; // Clear preview container
}

// Function to clear file input and preview
function clearFileInputAndPreview() {
    fileInput.value = ''; // Reset file input value
    clearFilePreview(); // Clear file preview
}
