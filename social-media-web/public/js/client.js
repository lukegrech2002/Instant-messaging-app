window.onload = displayLogin;

//Displaying login form
function displayLogin() {
    document.getElementById("topBar").style.display = "none";
    document.getElementById("homePage").style.display = "none";
    document.getElementById("registerPage").style.display = "none";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("loginForm").style.display = "block";
}

//Displaying register form
function displayRegister() {
    document.getElementById("navigationBar").style.display = "none";
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerPage").style.display = "block";
    document.getElementById("registerForm").style.display = "block";
}

function signOut(){
    //.replace instead of .href so user cant navigate back
    window.location.replace("http://localhost:4000/");
}
