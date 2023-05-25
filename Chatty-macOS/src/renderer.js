document.getElementById('self-user').textContent = localStorage.getItem("username")
if (localStorage.getItem('status') !== 'null'){
    document.getElementById('self-status').textContent = localStorage.getItem("status")
}
else{
    document.getElementById('self-status').textContent = ' '
}
document.getElementById('self-pfp').src = 'http://'+ localStorage.getItem('server') +localStorage.getItem('selfProfilePicture')

let inputChat = document.getElementById('input')
if (inputChat !== null){
    inputChat.addEventListener("focus", activateBorder);
    inputChat.addEventListener("blur", deactivateBorder);
}
let prevColor = ''

function activateBorder(){
    prevColor = document.getElementById('input-wrapper').style.borderColor
    document.getElementById('input-wrapper').style.borderColor = "#c65584"
}

function deactivateBorder(){
    document.getElementById('input-wrapper').style.borderColor = prevColor
}

document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
    const isDarkMode = await window.darkMode.toggle()
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

document.getElementById('reset-to-system').addEventListener('click', async () => {
    await window.darkMode.system()
    document.getElementById('theme-source').innerHTML = 'System'
})

