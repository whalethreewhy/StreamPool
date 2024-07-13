// Get the modals
var modal = document.getElementById("Hidden");
var modal2 = document.getElementById("Hidden2");

// Get the profile icon that opens the modal
var profileIcon = document.getElementById("profile-icon");
var profileIcon2 = document.getElementById("profile-icon2");

// Get the elements that switch between modals
var triggerSignUp = document.getElementById("Signingup");
var triggerLogin = document.getElementById("login");

// Get the <span> element that closes the modal
var spans = document.getElementsByClassName("close");

// When the user clicks on the profile icon, open the login modal
profileIcon.onclick = function() {
    modal.style.display = "block";
    modal2.style.display = "none";
}

// profileIcon2.onclick = function() {
//     modal.style.display = "block";
//     modal2.style.display = "none";
// }

// When the user clicks on "Sign Up", open the sign-up modal
triggerSignUp.onclick = function() {
    modal.style.display = "none";
    modal2.style.display = "block";
}

// When the user clicks on "Login Here", open the login modal
triggerLogin.onclick = function() {
    modal.style.display = "block";
    modal2.style.display = "none";
}

// When the user clicks on <span> (x), close the modal 
// there are 2 spans
for (var i = 0; i < spans.length; i++) {
    spans[i].onclick = function() {
        modal.style.display = "none";
        modal2.style.display = "none";
    }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal || event.target == modal2) {
        modal.style.display = "none";
        modal2.style.display = "none";
    }
}