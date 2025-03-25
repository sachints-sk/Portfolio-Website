// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzcuU7_U9H0C8tGA9UgKj5B8hvHT3w4s4",
    authDomain: "adept-ethos-432515-v9.firebaseapp.com",
    projectId: "adept-ethos-432515-v9",
    storageBucket: "adept-ethos-432515-v9.appspot.com",
    messagingSenderId: "860179840435",
    appId: "1:860179840435:web:91bf20d35124d57b7d1fc6"
  };
  
  // Your web app's Firebase configuration

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  
  const blogForm = document.getElementById('blog-form');
  const errorMessage = document.getElementById('error-message'); 
  const contentSectionsContainer = document.getElementById('content-sections');
  let sectionCount = 0;
  
  // Check for authentication on page load
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('User is signed in:', user.uid);
    } else {
      // User is signed out
      console.log('User is signed out.');
      // Redirect to the login page
      window.location.href = '../login/'; // Replace 'login.html' with your actual login page
    }
  });
  
  // Add Section Button Functionality
  document.addEventListener('DOMContentLoaded', () => {
    const addSectionButton = document.getElementById('add-section');
    addSectionButton.addEventListener('click', () => {
      sectionCount++;
      const newSection = document.createElement('div');
      newSection.classList.add('content-section', 'col-12', 'mb-3', 'wow', 'fadeInUp');
      newSection.setAttribute('data-wow-delay', '.3s');
      newSection.innerHTML = `
      <div class="form_group">
        <label for="subHeading${sectionCount}">Subheading ${sectionCount}:</label>
        <input type="text" id="subHeading${sectionCount}" name="subHeading${sectionCount}">

        <select id="headingLevel${sectionCount}" name="headingLevel${sectionCount}">
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4" selected>Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
      </div>
        
        <div class="form_group">
          <input type="checkbox" id="hasImage${sectionCount}" name="hasImage${sectionCount}">
          <label for="hasImage${sectionCount}">Add Image</label>
        </div>
        <div class="form_group">
          <input type="file" id="image${sectionCount}" name="image${sectionCount}" accept="image/*">
          <label for="image${sectionCount}">Choose Image</label>
        </div>
        <div class="form_group">
          <textarea id="paragraph${sectionCount}" name="paragraph${sectionCount}"></textarea>
          <label for="paragraph${sectionCount}">Paragraph ${sectionCount}:</label>
        </div>
        <div class="form_btn">
          <button type="button" id="addBullet${sectionCount}">Add Bullet Point</button>
          <button type="button" id="addEmoji${sectionCount}">Add Emoji</button>
        </div>
      `;
      contentSectionsContainer.appendChild(newSection);
  
      // Add Bullet Point Functionality
      const addBulletBtn = document.getElementById(`addBullet${sectionCount}`);
      addBulletBtn.addEventListener('click', () => {
        const paragraphTextarea = document.getElementById(`paragraph${sectionCount}`);
        paragraphTextarea.value += '\n* ';
      });
  
      // Add Emoji Functionality
      const addEmojiBtn = document.getElementById(`addEmoji${sectionCount}`);
      addEmojiBtn.addEventListener('click', () => {
        const emojiInput = prompt("Enter your emoji (e.g., 😊):");
        if (emojiInput) {
          const paragraphTextarea = document.getElementById(`paragraph${sectionCount}`);
          paragraphTextarea.value += ` ${emojiInput} `;
        }
      });
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
      const category = document.getElementById('category').value;
      const conclusion = document.getElementById('conclusion').value;
      const thumbImageFile = document.getElementById('thumbImageInput').files[0];
      const postThumbImageFile = document.getElementById('postThumbImageInput').files[0];
  
      const contentSections = [];
      let allSectionsReady = true;
  
      // Function to collect section data (handling image uploads)
      function collectSectionData(i) {
        return new Promise(resolve => {
          requestAnimationFrame(() => {
            const subHeadingInput = document.getElementById(`subHeading${i}`);
            const paragraphInput = document.getElementById(`paragraph${i}`);
            const hasImageInput = document.getElementById(`hasImage${i}`);
            const imageInput = document.getElementById(`image${i}`);
            const imageFile = imageInput ? imageInput.files[0] : null;
  
            if (subHeadingInput && paragraphInput && hasImageInput) {
              const subHeading = subHeadingInput.value;
              const paragraph = paragraphInput.value.replace(/\n/g, '[newline]'); 
              const hasImage = hasImageInput.checked;
  
              let sectionData = {
                subHeading,
                paragraph,
                headingLevel: document.getElementById(`headingLevel${i}`).value
              };
  
              if (hasImage && imageFile) {
                uploadImage(imageFile, i).then(imageUrl => {
                  sectionData.imageUrl = imageUrl;
                  resolve(sectionData);
                })
                .catch(error => {
                  console.error("Error uploading image: ", error);
                  if (errorMessage) {
                    errorMessage.textContent = "Error uploading image.";
                  }
                  resolve(sectionData); 
                });
              } else {
                resolve(sectionData);
              }
            } else {
              allSectionsReady = false;
              resolve(null);
            }
          });
        });
      }
  
      // Process all sections sequentially using async/await
      async function processSections() {
        for (let i = 1; i <= sectionCount; i++) {
          const sectionData = await collectSectionData(i);
          if (sectionData !== null) {
            contentSections.push(sectionData);
          }
        }
  
        if (allSectionsReady) {
          const blogRef = db.collection('blogs').doc();
          const blogId = blogRef.id;
  
          uploadImage(thumbImageFile, blogId, 'thumb.jpg').then(thumbImageUrl => {
            uploadImage(postThumbImageFile, blogId, 'post.jpg').then(postThumbImageUrl => {
              blogRef.set({
                heading,
                introParagraph,
                category,
                content: contentSections,
                conclusion,
                thumbImageUrl,
                postThumbImageUrl,
                uid,
                datePosted: firebase.firestore.FieldValue.serverTimestamp()
              })
              .then(() => {
                console.log('Blog created with images!');
                // Redirect to your blog list or a success page
              })
              .catch(error => {
                console.error("Error creating blog document: ", error);
                if (errorMessage) {
                  errorMessage.textContent = error.message;
                }
              });
            }).catch(error => {
              console.error("Error uploading post thumb image: ", error);
              if (errorMessage) {
                errorMessage.textContent = error.message;
              }
            });
          }).catch(error => {
            console.error("Error uploading thumb image: ", error);
            if (errorMessage) {
              errorMessage.textContent = error.message;
            }
          });
        } else {
          console.error("Error: Not all sections are ready.");
          if (errorMessage) {
            errorMessage.textContent = "Error creating blog. Please check all sections are complete.";
          }
        }
      }
  
      processSections();
  
    } else {
      console.error("User is not signed in.");
    }
  });
  
  function uploadImage(file, sectionOrBlogId, imageName) {
    const storageRef = firebase.storage().ref(`blogs/${sectionOrBlogId}/images/${imageName}`);
  
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
  