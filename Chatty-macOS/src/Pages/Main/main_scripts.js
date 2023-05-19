document.getElementById('add-friend-button').addEventListener("click", window.sections.openFriends)
document.getElementById('self-button').addEventListener("click", window.sections.openSettings)
let input = document.getElementById("input");


window.onload = async function () {
     const username = localStorage.getItem('username')
     const response = await fetch(`http://localhost:3000/request-feed?token=${localStorage.getItem('token')}`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({}),
     });

     if (!response.ok) {
         console.log("Error when loading feed")
         throw new Error('request failed');
     }

     if (response.ok) {
         const data = await response.json();
         const feed = data.feed;
         for (let i = feed.length-1; i >= 0; i--){
             applyFeed(feed[i].message, window.utils.getMonthName(feed[i].createdAt.slice(6, 7)).slice(0, 3) + ' ' + feed[i].createdAt.slice(8,10), feed[i].username)
             }
     }
    await window.appends.appendFriendList()
}

 async function applyFeed(message, date, username) {
     let parent = document.getElementById('feed-div')
     let feedMessage = document.createElement('div')
     let feedProfile = document.createElement('button')
     let feedBackground = document.createElement('div')
     let pfp = document.createElement('img')
     let feedDate = document.createElement('div')
     let feedUser = document.createElement('medium')
     let feedText = document.createElement('div')

     feedMessage.className = 'feed-message'
     feedProfile.className = 'feed-user-button'
     feedBackground.className = 'feed-message-background'
     pfp.className = 'user-pfp'

     pfp.src = "http://localhost:3000" + await window.utils.getProfileUrl(username)
     feedDate.className = 'feed-date'
     feedDate.textContent = date
     feedUser.className = 'feed-name'
     feedUser.textContent = username
     feedText.className = 'feed-content'
     feedText.textContent = message


     parent.insertBefore(feedMessage, parent.firstChild)
     feedMessage.appendChild(feedProfile)
     feedMessage.appendChild(feedBackground)
     feedProfile.appendChild(pfp)
     feedProfile.appendChild(feedUser)
     feedProfile.appendChild(feedDate)
     feedBackground.appendChild(feedText)

 }

function uploadFeed(text){
    fetch(`http://localhost:3000/feed-message?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
        })
        .catch(error => {
            console.error(error);
        });
}

input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        let message = input.textContent
        if ((message !== null) && (message !== " ") && (message !== "")){
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            uploadFeed(message)
            let today = new Date
            let day
            if(today.getDate() < 10){day = "0" + today.getDate()}
            else {day = today.getDate()}
            let time = window.utils.getMonthName(today.getMonth() + 1).slice(0, 3) + " " + day
            applyFeed(message, time, localStorage.getItem('username'))
            input.textContent = ""
        }
    }
});
