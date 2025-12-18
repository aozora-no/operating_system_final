// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDKWHNX-c1fDJwxnoZFjHU5CMydkPGew50",
  authDomain: "operatingsystem-36182.firebaseapp.com",
  projectId: "operatingsystem-36182",
  storageBucket: "operatingsystem-36182.firebasestorage.app",
  messagingSenderId: "600629298596",
  appId: "1:600629298596:web:a31802e712a8a86a7f2d31",
  measurementId: "G-NSRMY7KNE6",
};

// Init app, auth, db (do this ONCE)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper to show messages
function showMessage(message, divId, duration = 1000) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;

  setTimeout(function () {
    messageDiv.style.opacity = 0;
    setTimeout(function () {
      messageDiv.style.display = "none";
    }, 90);
  }, duration);
}

// SIGN UP
const signUp = document.getElementById("submitSignUp");
if (signUp) {
  signUp.addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("email_signUp").value.trim();
    const password = document.getElementById("password_signUp").value;
    const firstName = document.getElementById("fname_signUp").value.trim();
    const lastName = document.getElementById("lName_signUp").value.trim();

    if (!email || !password || !firstName || !lastName) {
      showMessage("Please fill out all fields.", "signUpMessage");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // send verification email
        sendEmailVerification(user).then(() => {
          showMessage("Email verification link sent", "signUpMessage", 3000);
        });

        // data to store in Firestore
        const userData = {
          email: email,
          firstName: firstName,
          lastName: lastName,
          createdAt: new Date().toISOString(),
        };

        // write to Firestore: collection "users", document id = user.uid
        const docRef = doc(db, "email", user.uid);
        setDoc(docRef, userData)
          .then(() => {
            showMessage("Account created successfully", "signUpMessage", 2000);
            // optional redirect after slight delay
            setTimeout(() => {
              window.location.href = "index.html";
            }, 1200);
          })
          .catch((error) => {
            console.error("Error writing document", error);
            showMessage("Error saving user data", "signUpMessage", 3000);
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === "auth/email-already-in-use") {
          showMessage("Email address already exists!", "signUpMessage", 3000);
        } else if (errorCode === "auth/weak-password") {
          showMessage("Password is too weak", "signUpMessage", 3000);
        } else if (errorCode === "auth/invalid-email") {
          showMessage("Invalid email address", "signUpMessage", 3000);
        } else {
          showMessage("Unable to create user", "signUpMessage", 3000);
        }
      });
  });
}

// RESET PASSWORD
const resetPassword = document.getElementById("forgot_pass");
if (resetPassword) {
  resetPassword.addEventListener("click", (event) => {
    event.preventDefault();
    const email = document.getElementById("email_signIn").value.trim();

    if (!email) {
      showMessage(
        "Please enter your email to reset password.",
        "signInMessage",
        3000
      );
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        showMessage("Password reset email sent", "signInMessage", 3000);
      })
      .catch(() => {
        showMessage("Something went wrong", "signInMessage", 3000);
      });
  });
}

// SIGN IN
const signIn = document.getElementById("submitSignIn");
if (signIn) {
  signIn.addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("email_signIn").value.trim();
    const password = document.getElementById("password_signIn").value;

    if (!email || !password) {
      showMessage(
        "Please enter both email and password",
        "signInMessage",
        3000
      );
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        if (user.emailVerified) {
          showMessage("Login is successful", "signInMessage", 1500);
          localStorage.setItem("loggedInUserId", user.uid);
          setTimeout(() => {
            window.location.href = "homepage.html";
          }, 800);
        } else {
          showMessage(
            "Please verify your email before logging in.",
            "signInMessage",
            3000
          );
        }
      })
      .catch((error) => {
        const errorCode = error.code;

        if (errorCode === "auth/invalid-credential") {
          showMessage("Incorrect email or password", "signInMessage", 3000);
        } else if (errorCode === "auth/user-not-found") {
          showMessage("Account does not exist", "signInMessage", 3000);
        } else {
          showMessage("Login failed", "signInMessage", 3000);
        }
      });
  });
}
