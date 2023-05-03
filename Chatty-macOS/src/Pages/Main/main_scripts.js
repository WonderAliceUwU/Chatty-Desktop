 document.getElementById('self-user').textContent = localStorage.getItem("username")
 document.getElementById('self-status').textContent = localStorage.getItem("status")
 document.getElementById('self-button').addEventListener("click", openSettings)
 document.getElementById('add-friend-button').addEventListener("click", openFriends)
 var input = document.getElementById("feed-input");

 function getMonthName(monthNumber) {
     const date = new Date();
     date.setMonth(monthNumber - 1);

     return date.toLocaleString('en-US', { month: 'long' });
 }

window.onload = async function () {
     const username = localStorage.getItem('username')
     const response = await fetch(`http://localhost:8080/request-feed?token=${localStorage.getItem('token')}`, {
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
         console.log(data.feed);
         for (let i = feed.length-1; i >= 0; i--){
             applyFeed(feed[i].message, getMonthName(feed[i].createdAt.slice(6, 7)).slice(0, 3) + ' ' + feed[i].createdAt.slice(8,10), feed[i].username)
             }
     }

     const responseFriends = await fetch(`http://localhost:8080/request-list-friend?token=${localStorage.getItem('token')}`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({}),
     });
     if (!responseFriends.ok){
         console.log("Error when loading feed")
         throw new Error('request failed');
     }
     if (responseFriends.ok){
         const data = await responseFriends.json();
         const friendships = data.friends;
         for (let i = friendships.length-1; i >= 0; i--){
             let parent = document.getElementById('side-menu-content')

             let userItem=document.createElement('div')
             let friendButton = document.createElement('button')
             let pfp = document.createElement('img')
             let friendName = document.createElement('medium')
             let friendStatus = document.createElement('div')

             userItem.className = 'user-item'
             friendButton.className = 'friend-button'
             friendButton.id = "friend-button"
             friendName.className = 'friend-name'
             pfp.className = 'user-pfp'
             pfp.src = "https://external-preview.redd.it/oGZz2_J2HBzIeKkE1EwgoJ9PRWLKHkJwim13rGIVhCo.jpg?auto=webp&s=e35909b1339259ba04a26a31d825fd762c0c69cf"
             friendStatus.className = 'friend-status'

             friendName.textContent = friendships[i].username
             friendStatus.textContent = friendships[i].status


             parent.appendChild(userItem)
             userItem.appendChild(friendButton)
             friendButton.appendChild(pfp)
             friendButton.appendChild(friendName)
             friendButton.appendChild(friendStatus)

             friendButton.addEventListener("click", function(){
                 openChat(friendName.textContent + " " + friendStatus.textContent)
             });
         }
     }
 }

 function applyFeed(message, date, username){
     let parent = document.getElementById('feed-div')
     let feedMessage=document.createElement('div')
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
     pfp.src = "https://external-preview.redd.it/oGZz2_J2HBzIeKkE1EwgoJ9PRWLKHkJwim13rGIVhCo.jpg?auto=webp&s=e35909b1339259ba04a26a31d825fd762c0c69cf"
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

Array.from(document.getElementsByClassName("feed-user-button"))
    .forEach(function(element){
        element.addEventListener("click", function(){
            openChat(element)
        });
    });

function openChat(friendName){
    localStorage.setItem("userdata", friendName)
    location.href='../Chat/chat.html';
}

function openSettings(){
    localStorage.setItem("setting", "General")
    location.href = "../Settings/settings.html"
}

function openFriends(){
    location.href = "../Friends/friends.html"
}

function uploadFeed(text){
    fetch(`http://localhost:8080/feed-message?token=${localStorage.getItem('token')}`, {
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
        let message = input.value
        if ((message !== null) && (message !== " ") && (message !== "")){
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            uploadFeed(message)
            let today = new Date
            let day = "0"
            if(today.getDay() < 10){day = "0" + today.getDay()}
            else {day = today.getDay()}
            let time = getMonthName(today.getMonth() + 1).slice(0, 3) + " " + day
            applyFeed(message, time, localStorage.getItem('username'))
            input.value = ""
        }
    }
});
