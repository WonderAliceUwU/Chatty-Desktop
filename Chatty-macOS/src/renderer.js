document.getElementById('self-user').textContent = localStorage.getItem("username")
document.getElementById('self-status').textContent = localStorage.getItem("status")
document.getElementById('self-pfp').src = 'http://localhost:3000'+localStorage.getItem('selfProfilePicture')

document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
    const isDarkMode = await window.darkMode.toggle()
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

document.getElementById('login-theme-toggle').addEventListener('click', async () => {
    const isDarkMode = await window.darkMode.toggle()
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

document.getElementById('reset-to-system').addEventListener('click', async () => {
    await window.darkMode.system()
    document.getElementById('theme-source').innerHTML = 'System'
})

