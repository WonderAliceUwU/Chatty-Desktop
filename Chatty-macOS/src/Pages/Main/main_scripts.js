document.getElementById('add-friend-button').addEventListener("click", window.sections.openFriends)
document.getElementById('self-button').addEventListener("click", window.sections.openSettings)
document.getElementById('send-button').addEventListener("click", sendMessageAction)
const fileInput = document.getElementById('image-input');
const uploadButton = document.getElementById('image-button');
let input = document.getElementById("input");


window.onload = async function () {
    await window.appends.appendFriendList()
    await window.appends.refreshFriendsList()
    await getFeed().then(() => {
        hideLoadingScreen();
    })
}

async function getFeed(){
    const response = await fetch(`http://`+ localStorage.getItem('server') +`/request-feed?token=${localStorage.getItem('token')}`, {
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
        for (let i = feed.length - 1; i >= 0; i--) {
            if (feed[i].imageFilename !== null) {
                await applyFeed(feed[i].message, window.utils.getMonthName(feed[i].createdAt.slice(6, 7)).slice(0, 3) + ' ' + feed[i].createdAt.slice(8, 10), feed[i].username, feed[i].imageFilename)
            } else {
                await applyFeed(feed[i].message, window.utils.getMonthName(feed[i].createdAt.slice(6, 7)).slice(0, 3) + ' ' + feed[i].createdAt.slice(8, 10), feed[i].username, null)
            }
        }
    }
}
 async function applyFeed(message, date, username, filename) {
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

     pfp.src = "http://"+ localStorage.getItem('server') + await window.utils.getProfileUrl(username)
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

     if (filename !== null){
         let image = document.createElement('img')
         image.className = 'chat-image'
         image.src = 'http://'+ localStorage.getItem('server') + '/uploads/' + filename
         feedBackground.appendChild(image)
     }
 }

function uploadFeed(text){
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('text', text);
    fetch(`http://`+ localStorage.getItem('server') +`/feed-message?token=${localStorage.getItem('token')}`, {
        method: 'POST',
        body: formData
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
        sendMessageAction()
    }
});

async function reloadFeed() {
    const elements = document.getElementsByClassName("feed-message");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
    document.getElementById('loading-screen').style.display = 'flex'
    setTimeout(async () => {
        await getFeed()
        hideLoadingScreen();
    }, 500);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'none';
}

function sendMessageAction(){
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
        if(fileInput.files.length === 0){
            applyFeed(message, time, localStorage.getItem('username'), null)
        }
        else{
            reloadFeed()
        }
        input.textContent = ""
        closeImageWrapper()
    }
}

// Trigger the file input when the button is clicked
uploadButton.addEventListener('click', () => {
    fileInput.click();
});

// Handle the file selection
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const imageUrl = event.target.result;

        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '15rem'
        img.style.borderRadius = '1rem'

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

function closeImageWrapper(){
    fileInput.value = '';
    document.getElementById('image-wrapper').innerHTML = '';
    document.getElementById('image-wrapper').style.visibility = 'hidden'
}
