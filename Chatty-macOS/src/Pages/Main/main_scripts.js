 document.getElementById('self-user').textContent = localStorage.getItem("username")
 document.getElementById('self-status').textContent = localStorage.getItem("status")
 document.getElementById('self-button').addEventListener("click", openSettings)
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
         throw new Error('Login failed');
     }

     if (response.ok) {
         const data = await response.json();
         const feed = data.feed;
         console.log(data.feed);
         for (let i = feed.length-1; i >= 0; i--){
             let feedMessage=document.createElement('div')
             feedMessage.className = 'feed-message'
             let parent = document.getElementById('feed-div')
             parent.appendChild(feedMessage)


             let feedProfile = document.createElement('button')
             feedProfile.className = 'feed-user-button'
             let feedBackground = document.createElement('div')
             feedBackground.className = 'feed-message-background'

             feedMessage.appendChild(feedProfile)
             feedMessage.appendChild(feedBackground)

             let pfp = document.createElement('img')
             pfp.className = 'user-pfp'
             pfp.src = "https://external-preview.redd.it/oGZz2_J2HBzIeKkE1EwgoJ9PRWLKHkJwim13rGIVhCo.jpg?auto=webp&s=e35909b1339259ba04a26a31d825fd762c0c69cf"


             let cleanDate = getMonthName(feed[i].createdAt.slice(6, 7)).slice(0, 3) + ' ' + feed[i].createdAt.slice(8,10)
             let feedDate = document.createElement('div')
             feedDate.className = 'feed-date'
             feedDate.textContent = cleanDate

             let feedUser = document.createElement('medium')
             feedUser.className = 'feed-name'
             feedUser.textContent = feed[i].username

             feedProfile.appendChild(pfp)
             feedProfile.appendChild(feedUser)
             feedProfile.appendChild(feedDate)

             let feedText = document.createElement('div')
             feedText.className = 'feed-content'
             feedText.textContent = feed[i].message

             feedBackground.appendChild(feedText)
             }
     }
 }

Array.from(document.getElementsByClassName("friend-button"))
    .forEach(function(element){
        element.addEventListener("click", function(){
            openChat(element)
        });
    });

Array.from(document.getElementsByClassName("feed-user-button"))
    .forEach(function(element){
        element.addEventListener("click", function(){
            openChat(element)
        });
    });

function openChat(element){
    const user = element.textContent;
    localStorage.setItem("userdata", user)
    location.href='../Chat/chat.html';
}

function openSettings(){
    localStorage.setItem("setting", "General")
    location.href = "../Settings/settings.html"
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
            input.value = ""
            window.electron.reloadPage()
        }
    }
});
