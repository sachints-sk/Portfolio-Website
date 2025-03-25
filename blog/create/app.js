// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzcuU7_U9H0C8tGA9UgKj5B8hvHT3w4s4",
    authDomain: "adept-ethos-432515-v9.firebaseapp.com",
    projectId: "adept-ethos-432515-v9",
    storageBucket: "adept-ethos-432515-v9.appspot.com",
    messagingSenderId: "860179840435",
    appId: "1:860179840435:web:91bf20d35124d57b7d1fc6"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage(); 

  
  
  const blogForm = document.getElementById('blog-form');
  const errorMessage = document.getElementById('error-message');
  const contentSectionsContainer = document.getElementById('content-sections');
  let sectionCount = 1;
  
  // Add Section Button Functionality
  document.addEventListener('DOMContentLoaded', () => {
    const addSectionButton = document.getElementById('add-section');
    addSectionButton.addEventListener('click', () => {
      sectionCount++;
      const newSection = document.createElement('div');
      newSection.classList.add('content-section');
      newSection.innerHTML = `
        <label for="subHeading${sectionCount}">Subheading ${sectionCount}:</label>
        <input type="text" id="subHeading${sectionCount}" name="subHeading${sectionCount}">
        <label for="paragraph${sectionCount}">Paragraph ${sectionCount}:</label>
        <textarea id="paragraph${sectionCount}" name="paragraph${sectionCount}"></textarea>
      `;
      contentSectionsContainer.appendChild(newSection);
    });
  });
  
  // Blog Form Submission
  blogForm.addEventListener('submit', (event) => {
    event.preventDefault();
  
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
  
      const heading = document.getElementById('heading').value;
      const introParagraph = document.getElementById('introParagraph').value;
      const conclusion = document.getElementById('conclusion').value;
      const thumbImageFile = document.getElementById('thumbImageInput').files[0];
      const postThumbImageFile = document.getElementById('postThumbImageInput').files[0];
  
      const contentSections = [];
      for (let i = 1; i <= sectionCount; i++) {
        const subHeading = document.getElementById(`subHeading${i}`).value;
        const paragraph = document.getElementById(`paragraph${i}`).value;
        contentSections.push({ subHeading, paragraph });
      }
  
      const blogRef = db.collection('blogs').doc();
      const blogId = blogRef.id;
  
      uploadImage(thumbImageFile, blogId, 'thumb.jpg').then(thumbImageUrl => {
        uploadImage(postThumbImageFile, blogId, 'post.jpg').then(postThumbImageUrl => {
          blogRef.set({
            datePosted: firebase.firestore.FieldValue.serverTimestamp(),
            heading,
            introParagraph,
            content: contentSections,
            conclusion,
            thumbImageUrl,
            postThumbImageUrl,
            uid
          })
          .then(() => {
            console.log('Blog created with images!');
            // Redirect to your blog list or a success page
          })
          .catch((error) => {
            console.error("Error creating blog document: ", error);
            errorMessage.textContent = error.message;
          });
        }).catch(error => {
          console.error("Error uploading post thumb image: ", error);
          errorMessage.textContent = error.message;
        });
      }).catch(error => {
        console.error("Error uploading thumb image: ", error);
        errorMessage.textContent = error.message;
      });
  
    } else {
      // User is not signed in
      console.error("User is not signed in.");
      // You might want to redirect to the login page or display a message
    }
  });
  
  function uploadImage(file, blogId, imageName) {
    const storageRef = firebase.storage().ref(`blogs/${blogId}/images/${imageName}`);
    
    // Ensure the user is authenticated
    return firebase.auth().currentUser.getIdToken(true)
      .then((token) => {
        return storageRef.put(file, {
          customMetadata: { 'authToken': token }
        });
      })
      .then((snapshot) => {
        return snapshot.ref.getDownloadURL();
      })
      .catch((error) => {
        console.error("Error uploading image: ", error);
        if (error.code === 'storage/unauthorized') {
          alert("You don't have permission to upload this image. Please check your Firebase Storage rules.");
        }
      });
}
