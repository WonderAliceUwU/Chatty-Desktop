document.querySelector("#login-button").addEventListener("click", login)
document.querySelector("#register-button").addEventListener("click", goRegister)
document.getElementById("PassInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        login()
    }
});
document.getElementById('login-theme-toggle').addEventListener('click', async () => {
    const isDarkMode = await window.darkMode.toggle()
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

if (localStorage.getItem('appearance') === null){
    localStorage.setItem('appearance', 'system');
}
window.onload = async function () {
    if (localStorage.getItem('server') === null){
        defaultIP()
    }
    if (localStorage.getItem('username') !== null && localStorage.getItem('logged') === 'yes'){
        await window.electron.connectServer(localStorage.getItem('username'), localStorage.getItem('server')).then(r => {
            location.href = '../Main/main.html'
        })
    }
}
async function login(){
    const username = document.getElementById("UserInput").value;
    const password = document.getElementById("PassInput").value;

    if(username !== "" && password !== ""){
        try {
            const response = await fetch('http://' + localStorage.getItem('server') +'/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                document.getElementById('error-label').style.visibility = "visible"
                throw new Error('Login failed');
            }

            if (response.ok) {
                const data = await response.json();
                const token = data.token;

                // Store the token in localStorage for future use
                localStorage.setItem('token', token);
                localStorage.setItem('username', username)
                localStorage.setItem('status', data.status)
                localStorage.setItem('selfProfilePicture', data.pfp)
                await window.electron.connectServer(username, localStorage.getItem('server')).then(r => {
                    localStorage.setItem('logged', 'yes');
                    location.href = '../Main/main.html'
                })
            }
        } catch (err) {
            console.error(err);
        }
    }
    else{
        document.getElementById('error-label').style.visibility = "visible"
    }
}

var x = document.getElementById("PassInput");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }

function goRegister(){
    location.href='../Register/register.html'
}

const revealButton = document.getElementById('ip-button');
const inputContainer = document.getElementById('input-container');
document.getElementById('ip-input').addEventListener('input', enableButton)
document.getElementById('change-ip-button').addEventListener('click', saveIP)
document.getElementById('default-ip-button').addEventListener('click', defaultIP)
if (localStorage.getItem('server') !== null){
    if (localStorage.getItem('server') === '34.175.204.177:3000'){
        document.getElementById('ip-input').value = 'Default IP'
    }
    else{
        document.getElementById('ip-input').value = localStorage.getItem('server')
    }
}
document.getElementById('change-ip-button').disabled = true

function enableButton(){
    document.getElementById('change-ip-button').disabled = false
}

revealButton.addEventListener('click', toggleInputContainer);

function toggleInputContainer() {
    inputContainer.classList.toggle('show');
}

function saveIP(){
    localStorage.setItem('server', document.getElementById('ip-input').value)
    document.getElementById('change-ip-button').disabled = true
}

function defaultIP(){
    localStorage.setItem('server', '34.175.204.177:3000')
    document.getElementById('ip-input').value = 'Chatty server'
    document.getElementById('change-ip-button').disabled = true
}
