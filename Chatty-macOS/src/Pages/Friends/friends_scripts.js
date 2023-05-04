document.getElementById('self-button').addEventListener("click", window.sections.openSettings)
document.getElementById('back-chat-button').addEventListener("click", window.sections.openMain)
let input = document.getElementById("feed-input");

window.onload = async function () {
    const response = await fetch(`http://localhost:3000/request-friend-requests?token=${localStorage.getItem('token')}`, {
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
            pfp.src = "http://localhost:3000"+ await window.utils.getProfileUrl(requestsFriends[i].username)
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
    await window.appends.appendFriendList()
}

async function searchFriends(requestedFriend) {
    console.log(requestedFriend)
    const response = await fetch(`http://localhost:3000/request-friend?token=${localStorage.getItem('token')}`, {
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
            pfp.src = "http://localhost:3000"+await window.utils.getProfileUrl(friends[i].username)
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

    let response = await fetch(`http://localhost:3000/make-request?token=${localStorage.getItem('token')}`, {
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
    let response = await fetch(`http://localhost:3000/accept-request?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({target}),
    });
    if (response.ok){
        friendButton.remove()
        window.location.reload()
    }
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
