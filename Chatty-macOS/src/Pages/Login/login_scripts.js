document.querySelector("#login-button").addEventListener("click", login)
document.querySelector("#register-button").addEventListener("click", goRegister)
document.getElementById('login-theme-toggle').addEventListener('click', async () => {
    const isDarkMode = await window.darkMode.toggle()
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

async function login(){
    const username = document.getElementById("UserInput").value;
    const password = document.getElementById("PassInput").value;

    if(username !== "" && password !== ""){
        try {
            const response = await fetch('http://localhost:3000/login', {
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
                await window.electron.connectServer(username).then(r => {
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
