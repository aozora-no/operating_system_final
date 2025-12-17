// Import the functions you need from the SDKs you need
    
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

import{getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js"
    
const firebaseConfig = {
  apiKey: "AIzaSyDKWHNX-c1fDJwxnoZFjHU5CMydkPGew50",
  authDomain: "operatingsystem-36182.firebaseapp.com",
  projectId: "operatingsystem-36182",
  storageBucket: "operatingsystem-36182.firebasestorage.app",
  messagingSenderId: "600629298596",
  appId: "1:600629298596:web:a31802e712a8a86a7f2d31",
  measurementId: "G-NSRMY7KNE6"

};


 const app = initializeApp(firebaseConfig);

 function showMessage(message, divId, duration = 1000){
    var messageDiv=document.getElementById(divId);
    messageDiv.style.display="block";
    messageDiv.innerHTML=message;
    messageDiv.style.opacity=1;
    setTimeout(function() {
        messageDiv.style.opacity = 0;
        // After opacity transition completes, hide the element completely
        setTimeout(function() {
            messageDiv.style.display = "none";

        }, 90); 
    }, duration);
 }
//this button will (submit signUp) get the email, password, firstname and lastName
 const signUp=document.getElementById('submitSignUp');
 
 //This is the function of the button
 signUp.addEventListener('click', (event)=>{
    event.preventDefault();
    const email=document.getElementById('email_signUp').value;
    const password=document.getElementById('password_signUp').value;
    const firstName=document.getElementById('fname_signUp').value;
    const lastName=document.getElementById('lName_signUp').value;

    const auth = getAuth();
    const db = getFirestore();

    //sending Authentication via email what you in email
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
        const user=userCredential.user;

        sendEmailVerification(auth.currentUser)
                .then(() => {
                    showMessage('Email Verification link sent', 'signUpMessage')
                });

        const userData={
            email: email,
            firstName: firstName,
            lastName:lastName
        };
        //Pop-up message for account created, then some tryCatch if not properly created
        showMessage('Account Created Successfully', 'signUpMessage');
        const docRef=doc(db, "users", user.uid);
        setDoc(docRef,userData)
        .then(()=>{
            window.location.href='index.html';
        })
        .catch((error)=>{
            console.error("Error writing document", error);

        });
    })
    .catch((error)=>{
        const errorCode=error.code;
        if(errorCode=='auth/email-already-in-use'){
            showMessage('Email Address Already Exists!', 'signUpMessage');
        }
        else{
            showMessage('Unable to create User', 'signUpMessage');
        }
    })
 });

 const resetPassword = document.getElementById("forgot_pass");
 resetPassword.addEventListener("click", function(){
        event.preventDefault();
    const email = document.getElementById('email_signIn').value;
    const auth = getAuth();

    if (!email) {
        showMessage('Please enter your email to reset password.', 'signInMessage');
        
    }else {
        sendPasswordResetEmail(auth, email)
        .then(() => {
            showMessage('Password Reset sent', 'signInMessage', 3000);
            
        })
        .catch((error) => {
            showMessage('Something Wrong', 'signInMessage');
        });

    }

 });

 //again, the start of the signIn
 const signIn = document.getElementById('submitSignIn');
//the function of the signIn button
 signIn.addEventListener('click', (event) => {
     event.preventDefault();
     const email = document.getElementById('email_signIn').value;
     const password = document.getElementById('password_signIn').value;
     const auth = getAuth();
    
     //code for authentication verification email
     signInWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
         const user = userCredential.user;
 
         // Check if the user email is verified
         if (user.emailVerified) {
             showMessage('Login is successful', 'signInMessage');
             localStorage.setItem('loggedInUserId', user.uid);
             window.location.href = 'homepage.html';
         } else {
             showMessage('Please verify your email before logging in.', 'signInMessage');
         }
     })
     .catch((error) => {
        const errorCode = error.code;
        const email = document.getElementById('email_signIn').value;
        const password = document.getElementById('password_signIn').value;
        
        if (!email || !password) {
            showMessage('Please enter both email and password', 'signInMessage');
        }
        else if (errorCode === 'auth/invalid-credential') {
            showMessage('Incorrect Email or Password', 'signInMessage');
        }
        else if (errorCode === 'auth/user-not-found') {
            showMessage('Account does not exist', 'signInMessage');
        }
        else {
            showMessage('Login failed', 'signInMessage');
        }
     });
 });


