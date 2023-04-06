document.getElementById('self-user').textContent = localStorage.getItem("username")
document.getElementById('general-button').addEventListener("click", openGeneral)
document.getElementById('profile-button').addEventListener("click", openProfile)
document.getElementById('back-button').addEventListener("click", openMain)

function openGeneral(){
    location.href = "settings-general.html"
}

function openProfile(){
    location.href = "settings-profile.html"
}

function openMain(){
    location.href = "../Main/main.html"
}
