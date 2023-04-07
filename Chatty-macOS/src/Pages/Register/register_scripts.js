document.querySelector("#login-button").addEventListener("click", goLogin)
document.querySelector("#register-button").addEventListener("click", register)

async function register(){
    const errorLabel = document.getElementById('error-label')
    const username = document.getElementById("UserInput").value;
    const password = document.getElementById("PassInput").value;
    const passwordRep = document.getElementById("RepeatPassInput").value;

    if(username !== "" && password !== "" && passwordRep !== ""){
        if (password === passwordRep){
            try {
                const response = await fetch('http://localhost:8080/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                if (!response.ok) {
                    errorLabel.textContent = "The username is already taken"
                    errorLabel.style.visibility = "visible"
                    throw new Error('Login failed');
                }

                const data = await response.json();
                console.log(data); // logged in successfully
                localStorage.setItem('username', username)
                location.href = '../Main/main.html'
            } catch (err) {
                console.error(err);
            }
        } else{
            errorLabel.textContent = "The passwords don't match"
            errorLabel.style.visibility = "visible"
        }
    } else{
        errorLabel.textContent = "Something is missing, please check"
        errorLabel.style.visibility = "visible"
    }
}

var x = document.getElementById("PassInput");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }

function goLogin(){
    location.href='../Login/login.html'
}
