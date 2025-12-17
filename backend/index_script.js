//this whole code function is to display the sign in and sign up design in html


const signUpButton=document.getElementById('signUpButton');
const signInButton=document.getElementById('signInButton');
const signInForm=document.getElementById('signIn');
const signUpForm=document.getElementById('signup');
const signInButton2=document.getElementById('signIn_Button2');
const signUpButton2=document.getElementById('signUp_Button2');


signUpButton.addEventListener('click',function(){
    signInForm.style.display="none";
    signUpForm.style.display="block";
});
signInButton.addEventListener('click', function(){
    signInForm.style.display="block";
    signUpForm.style.display="none";
});


signUpButton2.addEventListener('click', function(){
    signInForm.style.display="none";
    signUpForm.style.display="block";
});

signInButton2.addEventListener('click', function(){
    signInForm.style.display="block";
    signUpForm.style.display="none";
});

//Password Show
let password_icon = document.getElementById('password_signUp');
let eye_icon = document.getElementById('eye_icon_signUp');

let password_icon2 = document.getElementById('password_signIn');
let eye_icon2 = document.getElementById('eye_icon_signIn');

eye_icon.onclick = function() {
   if (password_icon.type == "password"){
       password_icon.type = "type";
       eye_icon.src = "style/icons/open-eye.png";
   }else {
       password_icon.type = "password";
       eye_icon.src = "style/icons/close-eye.png";
   }
}

eye_icon2.onclick = function() {
    if (password_icon2.type == "password"){
        password_icon2.type = "type";
        eye_icon2.src = "style/icons/open-eye.png";
    }else {
        password_icon2.type = "password";
        eye_icon2.src = "style/icons/close-eye.png";
    }
 }