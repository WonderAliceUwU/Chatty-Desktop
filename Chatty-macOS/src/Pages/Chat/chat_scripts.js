document.getElementById('self-user').textContent = localStorage.getItem("username")
document.getElementById('self-button').addEventListener("click", openSettings)
document.getElementById('chat-username').textContent = localStorage.getItem("userdata").split(/\r?\n/)[1]
document.getElementById('chat-status').textContent = localStorage.getItem("userdata").split(/\r?\n/)[2]
document.querySelector("#back-chat-button").addEventListener("click", back)

Array.from(document.getElementsByClassName("friend-button"))
    .forEach(function(element){
        element.addEventListener("click", function(){
            const user = element.textContent;
            localStorage.setItem("userdata", user)
            location.href='chat.html';
        });
        if (element.textContent === localStorage.getItem("userdata")){
            element.className = "visitedButton"
            element.role = "button"
        }
    });

function back(){
    location.href = "../Main/main.html"
}

function openSettings(){
    localStorage.setItem("setting", "General")
    location.href = "../Settings/settings-general.html"
}
