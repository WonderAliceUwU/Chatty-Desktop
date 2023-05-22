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


window.onload = async function () {
    let friend = localStorage.getItem("userdata").split(" ")[0].replace(/\s+/g, '')

    friendPFP.src = "http://localhost:3000"+await window.utils.getProfileUrl(friend)

    const response = await fetch(`http://localhost:3000/request-chat?token=${localStorage.getItem('token')}`, {
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
            let currentDate = window.utils.getMonthName(feed[i].createdAt.slice(6, 7)).slice(0, 3) + ' ' + feed[i].createdAt.slice(8,10);
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
    await fetch(`http://localhost:3000/read-friend?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({friend}),
    });
    await window.appends.appendFriendList('chat')
    await window.appends.refreshFriendsList()
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

    let feed = document.getElementById('lobby-feed')
    feed.scrollTop = feed.scrollHeight - feed.clientHeight;
}

function sendMessage(text){
    var friend = localStorage.getItem("userdata").split(" ")[0].replace(/\s+/g, '')
    fetch(`http://localhost:3000/send-message?token=${localStorage.getItem('token')}`, {
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
                let today = new Date
                let time = today.getHours() + ":" + today.getMinutes()
                applyMessage(text, localStorage.getItem("username"), time)
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
