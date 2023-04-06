document.querySelector("#login-button").addEventListener("click", login)

function login(){
    const username = document.getElementById("UserInput").value;
    window.electron.sendServer(username)
        .then(r => {
            let aut = window.electron.receiveServer()
            console.log(aut)
        });

    localStorage.setItem("username", username)
    location.href = "../Main/main.html"
}

var x = document.getElementById("PassInput");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
