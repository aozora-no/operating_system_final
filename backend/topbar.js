// topbar.js
(async function () {
  const placeholder = document.getElementById('global-topbar');
  if (!placeholder) return;

  // Load topbar HTML
  try {
    const res = await fetch('topbar.html');
    const html = await res.text();
    placeholder.innerHTML = html;
  } catch (e) {
    console.error('Failed to load topbar.html', e);
    return;
  }

  const homeBtn = document.getElementById('topbarHomeBtn');
  const signOutBtn = document.getElementById('topbarSignOutBtn');

  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      window.location.href = 'homepage.html';
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js');
        const { getAuth, signOut } = await import('https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js');

        const firebaseConfig = {
          apiKey: "AIzaSyDKWHNX-c1fDJwxnoZFjHU5CMydkPGew50",
          authDomain: "operatingsystem-36182.firebaseapp.com",
          projectId: "operatingsystem-36182",
          storageBucket: "operatingsystem-36182.firebasestorage.app",
          messagingSenderId: "600629298596",
          appId: "1:600629298596:web:a31802e712a8a86a7f2d31",
          measurementId: "G-NSRMY7KNE6"
        };

        // Initialize or reuse app
        try {
          initializeApp(firebaseConfig);
        } catch (e) {
          // ignore "already exists" error
        }
        const auth = getAuth();

        await signOut(auth);
        localStorage.removeItem('loggedInUserId');
        if (window.showNotification) {
          showNotification('success', 'Signed out', 'You have been signed out.');
        }
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
      } catch (err) {
        console.error(err);
        if (window.showNotification) {
          showNotification('error', 'Error', 'Failed to sign out.');
        }
      }
    });
  }
})();
