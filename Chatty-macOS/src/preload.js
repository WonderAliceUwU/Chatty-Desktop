const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system'),
})

contextBridge.exposeInMainWorld('electron', {
    reloadPage: () => ipcRenderer.invoke('reload-page'),
    connectServer: (token) => ipcRenderer.invoke('connect-server', token),
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
        const response = await fetch(`http://localhost:3000/request-pfp-url`, {
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
        const response = await fetch(`http://localhost:3000/request-list-friend?token=${localStorage.getItem('token')}`, {
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
            const friendships = data.friends;
            for (let i = friendships.length - 1; i >= 0; i--) {
                let url
                let username = friendships[i].username
                const responsePFP = await fetch(`http://localhost:3000/request-pfp-url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({username}),
                })
                if (response.ok) {
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
                friendButton.id = "friend-button"
                friendName.className = 'friend-name'
                pfp.className = 'user-pfp'
                pfp.src = "http://localhost:3000" + url
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
                        friendButton.className = "visitedButton"
                        friendButton.role = "button"
                    }
                }
            }
        }
    }
})
