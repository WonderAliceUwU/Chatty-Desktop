document.getElementById('self-user').textContent = localStorage.getItem("username")
document.getElementById("self-button").addEventListener("click", openSettings)
var input = document.getElementById("feed-input");


Array.from(document.getElementsByClassName("friend-button"))
    .forEach(function(element){
        element.addEventListener("click", function(){
            const user = element.textContent;
            localStorage.setItem("userdata", user)
            location.href='../Chat/chat.html';
        });
    });
function openSettings(){
    localStorage.setItem("setting", "General")
    location.href = "../Settings/settings-general.html"
}

input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        let message = input.value
        if ((message !== null) && (message !== " ") && (message !== "")){
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            window.electron.sendServer(message)
            input.value = ""
        }
    }
});
