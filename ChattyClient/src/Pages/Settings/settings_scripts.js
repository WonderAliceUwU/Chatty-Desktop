document.getElementById('back-button').addEventListener("click", window.sections.openMain)
document.getElementById('status-button').addEventListener("click", changeStatus)
document.getElementById('pfp-input').addEventListener('change', enableUpload);
document.getElementById('pfp-button').addEventListener('click', imageUpload);
document.getElementById('logout-button').addEventListener('click', logout);
document.getElementById('pfp-button').disabled = true

function enableUpload(){
    document.getElementById('pfp-button').disabled = false;
}

async function logout() {
    localStorage.setItem('logged', 'no');
    localStorage.removeItem('username');
    location.href = '../Login/login.html'
    await window.electron.logout()
}

async function imageUpload() {
    const formData = new FormData();
    const imageFile = document.getElementById('pfp-input');
    formData.append('image', imageFile.files[0]);
    formData.append('username', localStorage.getItem('username'));
// end AJAX request
    const response = await fetch('http://' + localStorage.getItem('server') + '/api/images', {
        method: 'POST',
        body: formData
    });
    if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url;
        localStorage.setItem('selfProfilePicture', imageUrl)
        window.location.reload()
    }
}

async function changeStatus(){
    const newStatus = document.getElementById('status-input').value
    const newUsername = ""
    const newPassword = ""
    const username = localStorage.getItem("username")
    try {
        const response = await fetch('http://' + localStorage.getItem('server') + '/change_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, newUsername, newPassword, newStatus }),
        });
        if(!response.ok) {
            //document.getElementById('error-label').style.visibility = "visible"
            throw new Error('Profile change failed');
        }
        if (response.ok){
            localStorage.setItem('status', newStatus)
            document.getElementById('status-input').value = "";
            await window.electron.reloadPage()
        }
    } catch (err) {
        console.error(err);
    }
}
