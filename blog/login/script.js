// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzcuU7_U9H0C8tGA9UgKj5B8hvHT3w4s4",
    authDomain: "adept-ethos-432515-v9.firebaseapp.com",
    projectId: "adept-ethos-432515-v9",
    storageBucket: "sachin_portfolio_website.appspot.com",
    messagingSenderId: "860179840435",
    appId: "1:860179840435:web:91bf20d35124d57b7d1fc6"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  const auth = firebase.auth();
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');
  const logoutButton = document.getElementById('logout-button');
  
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log('User signed in:', user); 
        // Redirect to your blog page or other protected area
        window.location.href = '../create2/'; // Replace with your actual URL
      })
      .catch((error) => {
        // Handle errors
        console.error("Error signing in:", error);
        errorMessage.textContent = error.message;
      });
  });

  function handleLogout() {
    auth.signOut()
      .then(() => {
        console.log('User signed out.');
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User signed out.',
          showConfirmButton: false, // Hide the "OK" button
          timer: 1500 // Auto-close the popup after 1.5 seconds 
        });
        // Redirect to the home page or login page (optional)
        // Replace 'home.html' with your desired URL
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  }

  logoutButton.addEventListener('click', handleLogout);