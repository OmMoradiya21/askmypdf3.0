// FILE: script.js

const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');
const dropZone = document.getElementById('dropZone');
const chatMessages = document.getElementById('chatMessages');
const sendQuestion = document.getElementById('sendQuestion');
const questionInput = document.getElementById('questionInput');

// === File Upload ===
fileInput.addEventListener('change', () => {
    uploadFile(fileInput.files[0]);
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    fileInput.files = e.dataTransfer.files;
    uploadFile(file);
});

removeFile.addEventListener('click', () => {
    fileInput.value = "";
    fileInfo.style.display = "none";
});

// === Upload File to Flask ===
function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            fileInfo.style.display = 'flex';
            fileName.textContent = file.name;
        } else {
            alert(data.error || "File upload failed.");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Error uploading file.");
    });
}

// === Ask Question to Flask ===
sendQuestion.addEventListener('click', () => {
    const question = questionInput.value.trim();
    if (!question) return alert("Please Enter a Question.");

    //send the question to the chat messages
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML += `<div style="width:129%;"><div style="background-color:#5b7cf4;border-radius:30px;padding:10px;float:right";><p style="color:white">${question}</p></div></div>`;
    chatMessages.appendChild(userMessage);
    questionInput.value = ""; // Clear input field

    //fetch the answer from Flask
    fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `question=${encodeURIComponent(question)}`
    })
    .then(res => res.json())
    .then(data => {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        botMessage.innerHTML += `<div style="width:129%;"><div style="background-color:#f1f1f1;border-radius:30px;padding:10px;float:left;"><p style="color:black">${data.answer || data.error || "No answer."}</p></div></div>`;
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    
    })
    .catch(err => {
        console.error(err);
        alert("Error asking question.");
    });
    
});
// === Handle Enter Key in Input ===
questionInput.addEventListener("keydown", (event) =>{
  if (event.key === "Enter") {
    event.preventDefault();
    sendQuestion.click(); // Trigger the button's click event
  }
});
