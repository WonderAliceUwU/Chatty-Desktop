document.querySelector("#login-button").addEventListener("click", login)
document.querySelector("#register-button").addEventListener("click", goRegister)

async function login(){
    const username = document.getElementById("UserInput").value;
    const password = document.getElementById("PassInput").value;

    if(username !== "" && password !== ""){
        try {
            const response = await fetch('http://localhost:8080/login', {
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

            const data = await response.json();
            console.log(data); // logged in successfully
            localStorage.setItem('username', username)
            location.href = '../Main/main.html'
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
