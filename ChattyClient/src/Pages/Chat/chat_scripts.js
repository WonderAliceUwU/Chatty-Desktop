document.getElementById('add-friend-button').addEventListener("click", window.sections.openFriends)
document.getElementById('self-button').addEventListener("click", window.sections.openSettings)
document.getElementById('send-button').addEventListener("click", sendMessageAction)
document.querySelector("#back-chat-button").addEventListener("click", window.sections.openMain)
let fullname = localStorage.getItem("userdata")
let friendStatus = fullname.slice(fullname.indexOf(" "))
document.getElementById('chat-username').textContent = fullname.split(" ")[0]
document.getElementById('chat-status').textContent = friendStatus
let input = document.getElementById("input");
let friendPFP = document.getElementById('chat-pfp')
const uploadButton = document.getElementById('image-button');
const fileInput = document.getElementById('image-input');
const settingButton = document.getElementById('chat-setting-button');
settingButton.addEventListener('click', toggleSettingContainer);
document.getElementById('unfriend-button').addEventListener('click', unfriendAction)
let friend = localStorage.getItem("userdata").split(" ")[0].replace(/\s+/g, '')

function toggleSettingContainer() {
    document.getElementById('setting-container').classList.toggle('show');
}

async function unfriendAction() {
    const response = await fetch(`http://` + localStorage.getItem('server') + `/unfriend?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({friend}),
    });
    if (!response.ok) {
        console.log("Error when loading chat")
    }
    if (response.ok) {
        location.href = '../Main/main.html'
    }
}

window.onload = async function () {
    friendPFP.src = "http://" + localStorage.getItem('server') + await window.utils.getProfileUrl(friend)
    await fetch(`http://` + localStorage.getItem('server') + `/read-friend?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({friend}),
    });
    await window.appends.appendFriendList('chat')
    await window.appends.refreshFriendsList()
    await refreshMessages()
}

async function refreshMessages() {
    const response = await fetch(`http://` + localStorage.getItem('server') + `/request-chat?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({friend}),
    });
    if (!response.ok) {
        console.log("Error when loading chat")
    }
    if (response.ok) {
        const data = await response.json();
        const feed = data.chat;
        let messagesDate = "1";
        for (let i = feed.length - 1; i >= 0; i--) {
            let parent = document.getElementById('chat-div')
            let currentDate = window.utils.getMonthName(feed[i].createdAt.slice(6, 7)).slice(0, 3) + ' ' + feed[i].createdAt.slice(8, 10);
            if (currentDate !== messagesDate) {
                messagesDate = document.createElement('div')
                messagesDate.textContent = currentDate
                messagesDate.className = "chat-date"

                parent.appendChild(messagesDate)

                messagesDate = currentDate
            }
            if (feed[i].imageFilename !== null) {
                applyMessage(feed[i].message, feed[i].username, feed[i].createdAt.slice(11, 16), feed[i].imageFilename)
            } else {
                applyMessage(feed[i].message, feed[i].username, feed[i].createdAt.slice(11, 16), null)
            }
        }
    }
}

function applyMessage(text, username, hour, filename){
    let parent = document.getElementById('chat-div')
    let feedMessage=document.createElement('div')
    let feedBackground = document.createElement('div')
    let feedText = document.createElement('div')
    let chatHour = document.createElement('div')

    feedText.textContent = text
    chatHour.className = 'chat-hour'
    chatHour.textContent = hour

    if(username === localStorage.getItem("username")){
        feedMessage.className = 'self-message'
        feedBackground.className = 'self-message-background'
        feedText.className = 'self-message-content'
    }
    else{
        feedMessage.className = 'friend-message'
        feedBackground.className = 'friend-message-background'
        feedText.className = 'friend-message-content'
        chatHour.style.textAlign = "left"
    }

    parent.appendChild(feedMessage)
    feedMessage.appendChild(chatHour)
    feedMessage.appendChild(feedBackground)
    feedBackground.appendChild(feedText)

    if (filename !== null){
        let image = document.createElement('img')
        image.className = 'message-image'
        image.src = 'http://' + localStorage.getItem('server') + '/uploads/' + filename
        feedBackground.appendChild(image)
    }
    scrollToBottom()
}


function sendMessage(text){
    let friend = localStorage.getItem("userdata").split(" ")[0].replace(/\s+/g, '')
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('text', text);
    formData.append('friend', friend);
    fetch(`http://` + localStorage.getItem('server') + `/send-message?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            if(response.ok){
                let today = new Date
                let time = today.getHours() + ":" + today.getMinutes()
                if(fileInput.files.length === 0) {
                    applyMessage(text, localStorage.getItem("username"), time, null)
                }
                else{
                    refreshMessages()
                }
                input.textContent = ""
                closeImageWrapper()
            }
        })
        .catch(error => {
            console.error(error);
        });
}

input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        sendMessageAction()
    }
});

function sendMessageAction(){
    let message = input.textContent
    if ((message !== null) && (message !== " ") && (message !== "")){
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        sendMessage(message)
        input.textContent = ""
    }
}

uploadButton.addEventListener('click', () => {
    fileInput.click();
});

// Handle the file selection
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const imageUrl = event.target.result;

        // Create an <img> element
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '15rem';
        img.style.borderRadius = '1rem';

        const closeButton = document.createElement('button');
        closeButton.className = 'custom-button'
        closeButton.id = 'close-image-button'
        closeButton.addEventListener('click', closeImageWrapper)

        document.getElementById('image-wrapper').innerHTML = '';
        document.getElementById('image-wrapper').style.visibility = 'visible'
        document.getElementById('image-wrapper').appendChild(img);
        document.getElementById('image-wrapper').appendChild(closeButton);
    };
    reader.readAsDataURL(file);
});

function scrollToBottom(){
    setTimeout(function() {
        let feed = document.getElementById('lobby-feed');
        feed.scrollTop = feed.scrollHeight - feed.clientHeight;
    }, 200);
}

function closeImageWrapper(){
    fileInput.value = '';
    document.getElementById('image-wrapper').innerHTML = '';
    document.getElementById('image-wrapper').style.visibility = 'hidden'
}
