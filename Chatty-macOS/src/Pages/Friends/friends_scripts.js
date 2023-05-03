document.getElementById('self-user').textContent = localStorage.getItem("username")
document.getElementById('self-status').textContent = localStorage.getItem("status")
document.getElementById('self-button').addEventListener("click", openSettings)
document.getElementById('back-chat-button').addEventListener("click", back)
var input = document.getElementById("feed-input");


window.onload = async function () {
    const response = await fetch(`http://localhost:8080/request-friend-requests?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });
    if (!response.ok){
        let parent = document.getElementById('search-div');
        let message = document.createElement('h4');
        message.id = 'requests-info-text'
        message.style.textAlign = 'left'
        message.textContent = 'It was not possible to load requests right now'
        parent.appendChild(message)
    }
    if (response.ok){
        const data = await response.json();
        const requestsFriends = data.requestsFriends;
        console.log(data.requestsFriends)
        if(requestsFriends.length < 1){
            let parent = document.getElementById('search-div');
            let message = document.createElement('h4');
            message.id = 'requests-info-text'
            message.style.textAlign = 'left'
            message.textContent = 'You don\'t have pending requests at this time'
            parent.appendChild(message)
        }
        for (let i = requestsFriends.length-1; i >= 0; i--){
            let parent = document.getElementById('search-div')
            let parentResult = document.getElementById('results-div')


            let friendResult=document.createElement('div')
            let friendButton = document.createElement('button')
            let pfp = document.createElement('img')
            let friendName = document.createElement('medium')
            let friendStatus = document.createElement('div')

            friendResult.className = 'search-item'
            friendButton.className = 'friend-button'
            friendButton.id = "friend-button-search"
            friendName.className = 'friend-name'
            pfp.className = 'user-pfp'
            pfp.src = "https://external-preview.redd.it/oGZz2_J2HBzIeKkE1EwgoJ9PRWLKHkJwim13rGIVhCo.jpg?auto=webp&s=e35909b1339259ba04a26a31d825fd762c0c69cf"
            friendStatus.className = 'friend-status'

            friendName.textContent = requestsFriends[i].username
            friendStatus.textContent = requestsFriends[i].status


            parentResult.appendChild(friendResult)
            friendResult.appendChild(friendButton)
            friendButton.appendChild(pfp)
            friendButton.appendChild(friendName)
            friendButton.appendChild(friendStatus)

            friendButton.addEventListener("click", function(){
                acceptFriendRequest(friendName.textContent, friendButton)
            });
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
                openChat(friendName.textContent + " " + friendStatus.textContent, friendButton)
            });
        }
    }
}

Array.from(document.getElementsByClassName("friend-button"))
    .forEach(function(element){
        element.addEventListener("click", function(){
            openChat(element)
        });
    });

function openChat(friendName){
    localStorage.setItem("userdata", friendName)
    location.href='../Chat/chat.html';
}

async function searchFriends(requestedFriend) {
    console.log(requestedFriend)
    const response = await fetch(`http://localhost:8080/request-friend?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({requestedFriend}),
    });
    if (!response.ok) {
        console.log("Error when searching friends")
        throw new Error('Search failed');
    }
    if (response.ok) {
        const data = await response.json();
        const friends = data.friends;
        console.log(data.friends)
        const elements = document.getElementsByClassName("search-item");
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
        for (let i = friends.length-1; i >= 0; i--){
            let parent = document.getElementById('search-div')
            let parentResult = document.getElementById('results-div')
            let text = document.getElementById('requests-info-text')
            if(text !== null){
                text.remove()
            }

            document.getElementById('setting-name').textContent = "Search results:"

            let friendResult=document.createElement('div')
            let friendButton = document.createElement('button')
            let pfp = document.createElement('img')
            let friendName = document.createElement('medium')
            let friendStatus = document.createElement('div')

            friendResult.className = 'search-item'
            friendButton.className = 'friend-button'
            friendButton.id = "friend-button-search"
            friendName.className = 'friend-name'
            pfp.className = 'user-pfp'
            pfp.src = "https://external-preview.redd.it/oGZz2_J2HBzIeKkE1EwgoJ9PRWLKHkJwim13rGIVhCo.jpg?auto=webp&s=e35909b1339259ba04a26a31d825fd762c0c69cf"
            friendStatus.className = 'friend-status'

            friendName.textContent = friends[i].username
            friendStatus.textContent = friends[i].status


            parentResult.appendChild(friendResult)
            friendResult.appendChild(friendButton)
            friendButton.appendChild(pfp)
            friendButton.appendChild(friendName)
            friendButton.appendChild(friendStatus)

            friendButton.addEventListener("click", function(){
                makeFriendRequest(friendName.textContent, friendButton)
            });
        }

    }
}

async function makeFriendRequest(target, friendButton) {

    let response = await fetch(`http://localhost:8080/make-request?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({target}),
    });
    if (response.ok){
        friendButton.remove()
    }
}

async function acceptFriendRequest(target, friendButton) {
    let response = await fetch(`http://localhost:8080/accept-request?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({target}),
    });
    if (response.ok){
        friendButton.remove()
    }
}
function back(){
    location.href = "../Main/main.html"
}

function openSettings(){
    localStorage.setItem("setting", "General")
    location.href = "../Settings/settings.html"
}


input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        let message = input.value
        if ((message !== null) && (message !== " ") && (message !== "")){
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            let requestedFriend = input.value
            searchFriends(requestedFriend)
        }
    }
});
