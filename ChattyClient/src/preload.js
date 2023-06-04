const { contextBridge, ipcRenderer } = require('electron');


ipcRenderer.on('message', (event, text, from, filename)=>{
    let today = new Date
    let time = today.getHours() + ":" + today.getMinutes()
    let friend = document.getElementById('visitedName').textContent
    if (friend === from){
        if (filename !== undefined){
            applyMessage(text, time, filename)

        }
        else{
            applyMessage(text, time, null)
        }
        fetch(`http://` + localStorage.getItem('server')+ `/read-friend?token=${localStorage.getItem('token')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({friend}),
        });
    }
    else{
        const friendElements = document.querySelectorAll('.friend-name');
        let friendElement;

        for (const element of friendElements) {
            if (element.textContent === from) {
                friendElement = element;
                break;
            }
        }
        friendElement.parentNode.className = 'unread-button'
    }
})

ipcRenderer.on('message-out', (event, from) => {
    const friendElements = document.querySelectorAll('.friend-name');
    let friendElement;

    for (const element of friendElements) {
        if (element.textContent === from) {
            friendElement = element;
            break;
        }
    }
    friendElement.parentNode.className = 'unread-button'
})

function applyMessage(text, time, filename){
    let parent = document.getElementById('chat-div')
    let feedMessage=document.createElement('div')
    let feedBackground = document.createElement('div')
    let feedText = document.createElement('div')
    let chatHour = document.createElement('div')

    feedText.textContent = text
    chatHour.className = 'chat-hour'
    chatHour.textContent = time
    feedMessage.className = 'friend-message'
    feedBackground.className = 'friend-message-background'
    feedText.className = 'friend-message-content'
    chatHour.style.textAlign = "left"


    parent.appendChild(feedMessage)
    feedMessage.appendChild(chatHour)
    feedMessage.appendChild(feedBackground)
    feedBackground.appendChild(feedText)

    if (filename !== null){
        let image = document.createElement('img')
        image.className = 'message-image'
        image.src = 'http://' + localStorage.getItem('server')+ '/uploads/' + filename
        feedBackground.appendChild(image)
    }

    let feed = document.getElementById('lobby-feed')
    feed.scrollTop = feed.scrollHeight - feed.clientHeight;
}

contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system'),
})

contextBridge.exposeInMainWorld('electron', {
    reloadPage: () => ipcRenderer.invoke('reload-page'),
    connectServer: (token, server) => ipcRenderer.invoke('connect-server', token, server),
    logout: () => ipcRenderer.invoke('logout'),
})

contextBridge.exposeInMainWorld('sections', {
    openFriends(){
        location.href = "../Friends/friends.html"
    },
    openMain(){
        location.href = "../Main/main.html"
    },
    openSettings(){
        localStorage.setItem("setting", "General")
        location.href = "../Settings/settings.html"
    },
    openChat(friendName){
        localStorage.setItem("userdata", friendName)
        location.href='../Chat/chat.html';
    },
})

contextBridge.exposeInMainWorld('utils', {
    async getProfileUrl(username) {
        const response = await fetch(`http://` + localStorage.getItem('server')+ `/request-pfp-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username}),
        })
        if (response.ok) {
            const data = await response.json();
            console.log(data.url)
            return data.url;
        }
    },
    getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber - 1);

        return date.toLocaleString('en-US', { month: 'long' });
    }
})

contextBridge.exposeInMainWorld('appends', {
    async appendFriendList(mode) {
        const response = await fetch(`http://` + localStorage.getItem('server')+ `/request-list-friend?token=${localStorage.getItem('token')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const responseUnreads = await fetch(`http://` + localStorage.getItem('server')+ `/request-unreads?token=${localStorage.getItem('token')}`, {
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
            let unreads;
            if (responseUnreads.ok){
                const dataUnreads = await responseUnreads.json();
                unreads = dataUnreads.unreads;
                console.log(unreads)
            }
            const friendships = data.friends;
            for (let i = friendships.length - 1; i >= 0; i--) {
                let url
                let username = friendships[i].username
                const responsePFP = await fetch(`http://`+ localStorage.getItem('server') +`/request-pfp-url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({username}),
                })
                if (responsePFP.ok) {
                    const data = await responsePFP.json();
                    url = data.url
                }

                let parent = document.getElementById('side-menu-content')

                let userItem = document.createElement('div')
                let friendButton = document.createElement('button')
                let pfp = document.createElement('img')
                let friendName = document.createElement('medium')
                let friendStatus = document.createElement('div')

                userItem.className = 'user-item'
                friendButton.className = 'friend-button'

                for (let j = unreads.length - 1; j >= 0; j--) {
                    if (unreads[j].friend === friendships[i].username){
                        friendButton.className = 'unread-button'
                    }
                }

                friendName.className = 'friend-name'
                pfp.className = 'user-pfp'
                pfp.src = "http://"+ localStorage.getItem('server') + url
                friendStatus.className = 'friend-status'

                friendName.textContent = friendships[i].username
                friendStatus.textContent = friendships[i].status


                parent.appendChild(userItem)
                userItem.appendChild(friendButton)
                friendButton.appendChild(pfp)
                friendButton.appendChild(friendName)
                friendButton.appendChild(friendStatus)

                friendButton.addEventListener("click", function () {
                    localStorage.setItem("userdata", friendName.textContent + " " + friendStatus.textContent)
                    location.href='../Chat/chat.html';
                });

                if (mode === 'chat'){
                    if (friendName.textContent === localStorage.getItem("userdata").split(" ")[0]){
                        friendButton.id = "visitedButton"
                        friendName.id = 'visitedName'
                        friendButton.role = "button"
                    }
                }
            }
        }
    },
    async refreshFriendsList() {
        const response = await fetch(`http://`+ localStorage.getItem('server') +`/request-friend-requests?token=${localStorage.getItem('token')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });
        if (response.ok) {
            const data = await response.json();
            const requestsFriends = data.requestsFriends;
            console.log(data.requestsFriends)
            if (requestsFriends.length > 0) {
                document.getElementById('friend-button-image').id = 'friend-button-image-new'
            }
        }
    }
})
