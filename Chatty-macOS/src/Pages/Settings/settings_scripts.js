document.getElementById('self-user').textContent = localStorage.getItem("username")
document.getElementById('general-button').addEventListener("click", openGeneral)
document.getElementById('profile-button').addEventListener("click", openProfile)
document.getElementById('back-button').addEventListener("click", openMain)
document.getElementById('status-button').addEventListener("click", changeStatus)
document.getElementById('self-status').value = localStorage.getItem('userStatus')
document.getElementById('pfp-input').addEventListener('change', imageUpload);
function openGeneral(){
    location.href = "settings.html"
}

function openProfile(){

}

function openMain(){
    location.href = "../Main/main.html"
}

async function imageUpload() {
    const imageFile = document.getElementById('pfp-input');
    if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile.files[0]);
        console.log("Image data: " + formData)
        fetch(`http://localhost:8080/upload-profile-image?token=${localStorage.getItem('token')}`, {
            method: 'POST',
            body: formData,
        }).then(response => {
            if (response.ok) {
                console.log('Image uploaded successfully!');
            } else {
                console.error('Error uploading image:', response.statusText);
            }
        }).catch(error => {
            console.error('Error uploading image:', error);
        });
    }
}

async function changeStatus(){
    const newStatus = document.getElementById('status-input').value
    const newUsername = ""
    const newPassword = ""
    const username = localStorage.getItem("username")
    //if(newUsername !== "" && newPassword !== "" && newStatus !== ""){
        try {
            const response = await fetch('http://localhost:8080/change_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, newUsername, newPassword, newStatus }),
            });

            if (!response.ok) {
                //document.getElementById('error-label').style.visibility = "visible"
                throw new Error('Profile change failed');
            }

            const data = await response.json();
            console.log(data); // logged in successfully
            localStorage.setItem('userStatus', newStatus)
            document.getElementById('status-input').value = "";
            location.reload()
        } catch (err) {
            console.error(err);
        }
    //}
   // else{

    //}
}
