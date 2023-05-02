document.getElementById('self-user').textContent = localStorage.getItem("username")
document.getElementById('self-status').textContent = localStorage.getItem("status")
document.getElementById('self-button').addEventListener("click", openSettings)
document.getElementById('chat-username').textContent = localStorage.getItem("userdata").split(/\r?\n/)[1]
document.getElementById('chat-status').textContent = localStorage.getItem("userdata").split(/\r?\n/)[2]
document.querySelector("#back-chat-button").addEventListener("click", back)
var input = document.getElementById("feed-input");

function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
}

window.onload = async function () {
    var friend = localStorage.getItem("userdata").split(/\r?\n/)[1].replace(/\s+/g, '')
    const response = await fetch(`http://localhost:8080/request-chat?token=${localStorage.getItem('token')}`, {
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
        for (let i = feed.length-1; i >= 0; i--){
            let parent = document.getElementById('chat-div')
            let currentDate = getMonthName(feed[i].createdAt.slice(6, 7)).slice(0, 3) + ' ' + feed[i].createdAt.slice(8,10);
            if(currentDate!==messagesDate){
                messagesDate = document.createElement('div')
                messagesDate.textContent = currentDate
                messagesDate.className = "chat-date"

                parent.appendChild(messagesDate)

                messagesDate = currentDate
            }
            applyMessage(feed[i].message, feed[i].username, feed[i].createdAt.slice(11,16))
        }
    }
}

function applyMessage(text, username, hour){
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
}

Array.from(document.getElementsByClassName("friend-button"))
    .forEach(function(element){
        element.addEventListener("click", function(){
            const user = element.textContent;
            localStorage.setItem("userdata", user)
            location.href='chat.html';
        });
        if (element.textContent === localStorage.getItem("userdata")){
            element.className = "visitedButton"
            element.role = "button"
        }
    });

function back(){
    location.href = "../Main/main.html"
}

function openSettings(){
    localStorage.setItem("setting", "General")
    location.href = "../Settings/settings.html"
}

function sendMessage(text){
    var friend = localStorage.getItem("userdata").split(/\r?\n/)[1].replace(/\s+/g, '')
    fetch(`http://localhost:8080/send-message?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend, text }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            if(response.ok){
            }
        })
        .catch(error => {
            console.error(error);
        });
}

input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        let message = input.value
        if ((message !== null) && (message !== " ") && (message !== "")){
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            sendMessage(message)
            let today = new Date
            let time = today.getHours() + ":" + today.getMinutes()
            applyMessage(message, localStorage.getItem("username"), time)
            input.value = ""
        }
    }
});
