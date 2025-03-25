// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzcuU7_U9H0C8tGA9UgKj5B8hvHT3w4s4",
    authDomain: "sachints.dev",
    projectId: "adept-ethos-432515-v9",
    storageBucket: "adept-ethos-432515-v9.appspot.com",
    messagingSenderId: "860179840435",
    appId: "1:860179840435:web:91bf20d35124d57b7d1fc6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Configure Google Sign-In provider
const provider = new firebase.auth.GoogleAuthProvider();



const blogDetailsContainer = document.getElementById('blog-details-container');
const recentBlogsContainer = document.getElementById('recent-blogs'); 
const searchForm = document.querySelector('.search-form');
const searchInput = document.getElementById('search');
const blogPostsContainer = document.getElementById('blog-posts-container');
const commentList = document.querySelector('.tj-latest__comments ul'); // Get the <ul> element for comments
const commentCount = document.getElementById('comment-count');
const signInOverlay = document.getElementById('sign-in-overlay');
const signInButton = document.getElementById('sign-in-button');
const commentFormContainer = document.getElementById('comment-form-container');
const commentForm = document.getElementById('comment-form');
const commentTextInput = document.getElementById('comment-text');


// Function to handle Google Sign-In
function signInWithGoogle() {
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in:", user);
      // Hide the sign-in overlay and show the comment form
      signInOverlay.style.display = 'none';
      commentFormContainer.style.display = 'block';
    })
    .catch((error) => {
      console.error("Error signing in:", error);
    });
}


// Attach sign-in event listener
signInButton.addEventListener('click', signInWithGoogle);



function displayBlogDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentBlogId = urlParams.get('id');
  
    // 1. Fetch All Blog IDs 
    db.collection("blogs").orderBy("datePosted", "desc").get()
      .then((querySnapshot) => {
        const allBlogIds = querySnapshot.docs.map(doc => doc.id);
  
        // 2. Get Previous/Next Blog IDs
        const { previousBlogId, nextBlogId } = getNavigationBlogIds(currentBlogId, allBlogIds);
  
        // Fetch the current blog details
        db.collection('blogs').doc(currentBlogId).get()
          .then(doc => {
            if (doc.exists) {
              const blogData = doc.data();
  
              // Create the thumbnail div
              const thumbDiv = document.createElement('div');
              thumbDiv.classList.add('tj-post__thumb');
              const thumbImage = document.createElement('img');
              thumbImage.src = blogData.thumbImageUrl; 
              thumbImage.alt = '';
              thumbDiv.appendChild(thumbImage);
  
              // Create the content div
              const contentDiv = document.createElement('div');
              contentDiv.classList.add('tj-post__content');
  
              // Create the meta div 
              const metaDiv = document.createElement('div');
              metaDiv.classList.add('tj-post__meta', 'entry-meta');
              const authorSpan = document.createElement('span');
              authorSpan.innerHTML = `<i class="fa-light fa-user"></i> <a href="#">By Admin</a>`;
              const dateSpan = document.createElement('span');
              dateSpan.innerHTML = `<i class="fa-light fa-calendar-days"></i> ${new Date(blogData.datePosted.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
              const commentsSpan = document.createElement('span');
              commentsSpan.innerHTML = ``;
              getCommentCount(currentBlogId)
              .then(commentCount => {
                commentsSpan.innerHTML = `<i class="fa-light fa-comments"></i><a href="#">Comments (${commentCount})</a>`; 
              })
              .catch(error => {
                console.error("Error fetching comment count:", error);
              });
              metaDiv.appendChild(authorSpan);
              metaDiv.appendChild(dateSpan);
              metaDiv.appendChild(commentsSpan);

             
  
              // Create the title h3
              const titleH3 = document.createElement('h3');
              titleH3.classList.add('tj-post__title', 'entry-title');
              titleH3.textContent = blogData.heading;
  
              // Create the content section
              const contentSection = document.createElement('div');
              contentSection.classList.add('tj-post__content');
  
              // Create the content paragraphs with images and bullet points
              blogData.content.forEach(section => {
                if (section.subHeading) {
                  const subHeading = document.createElement(section.headingLevel || 'h4'); 
                  subHeading.textContent = section.subHeading;
                  contentSection.appendChild(subHeading);
                }
  
                // Add the subheading image (if available)
                if (section.imageUrl) {
                  const subHeadingImage = document.createElement('img');
                  subHeadingImage.src = section.imageUrl;
                  subHeadingImage.alt = section.subHeading + " Image";
                  subHeadingImage.style.maxWidth = "100%";
                  subHeadingImage.style.height = "auto";
                  contentSection.appendChild(subHeadingImage);
                }
  
                // Handle paragraphs with potential bullet points
                const paragraphText = section.paragraph.replace(/\[newline]/g, '\n');
                const bulletRegex = /^\s*(\*|\-|\•)\s+(.+?)$/gm;
                const bulletMatches = paragraphText.matchAll(bulletRegex);
  
                let lastIndex = 0;
                const paragraphElement = document.createElement('p');
                paragraphElement.style.whiteSpace = 'pre-wrap';
  
                let bulletList = null;
  
                if (bulletMatches) {
                  bulletList = document.createElement('ul'); 
  
                  for (const match of bulletMatches) {
                    // Add plain text before the bullet point
                    const textBeforeBullet = paragraphText.substring(lastIndex, match.index);
                    if (textBeforeBullet.trim() !== "") {
                      paragraphElement.appendChild(document.createTextNode(textBeforeBullet));
                    }
  
                    // Create and add the bullet list item
                    const listItemContent = match[2].trim();
                    const firstNonWhitespaceIndex = listItemContent.search(/\S/);
                    const bulletPointText = listItemContent.substring(0, firstNonWhitespaceIndex);
                    const listItemText = listItemContent.substring(firstNonWhitespaceIndex).trim(); 
  
                    const listItem = document.createElement('li');
                    listItem.textContent = listItemText;
  
                    bulletList.appendChild(listItem); 
                    paragraphElement.appendChild(bulletList); 
  
                    lastIndex = match.index + match[0].length; 
                  }
                }
  
                // Add any remaining text after the last bullet point
                const textAfterBullet = paragraphText.substring(lastIndex);
                if (textAfterBullet.trim() !== "") {
                  paragraphElement.appendChild(document.createTextNode(textAfterBullet));
                }
  
                contentSection.appendChild(paragraphElement); 
              });
  
              // Create the conclusion paragraph
              const conclusion = document.createElement('p');
              conclusion.textContent = blogData.conclusion;
              contentSection.appendChild(conclusion);
  
              // Add elements to the content div
              contentDiv.appendChild(metaDiv);
              contentDiv.appendChild(titleH3);
              contentDiv.appendChild(contentSection); 
  
              // Add elements to the main article element
              blogDetailsContainer.appendChild(thumbDiv);
              blogDetailsContainer.appendChild(contentDiv);
  
              // 3. Display Navigation (after displaying the blog details)
              displayBlogNavigation(previousBlogId, nextBlogId, allBlogIds);

              displayComments(currentBlogId);

// Handle comment submissions
              handleCommentSubmit(currentBlogId);

  // Check if user is signed in and show/hide elements accordingly
  auth.onAuthStateChanged(user => {
    if (user) {
      signInOverlay.style.display = 'none';
      commentFormContainer.style.display = 'block';
    } else {
      signInOverlay.style.display = 'block';
      commentFormContainer.style.display = 'none';
    }
  });




            } else {
              console.error('Blog document not found!');
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'The blog you are looking for does not exist!',
                confirmButtonText: 'Go to Blogs', // Text for the button
                confirmButtonColor: '#3085d6',
                allowOutsideClick: false, // Prevent closing by clicking outside
  allowEscapeKey: false   // Optional: Set a custom color for the button
              }).then((result) => {
                if (result.isConfirmed) { 
                  window.location.href = 'blogstest.html'; // Replace 'blogs.html' with the URL of your blogs page
                } 
              });
            }
          })
          .catch(error => {
            console.error("Error fetching blog document: ", error);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'The blog you are looking for does not exist!',
              confirmButtonText: 'Go to Blogs', // Text for the button
              confirmButtonColor: '#3085d6',
              allowOutsideClick: false, // Prevent closing by clicking outside
  allowEscapeKey: false   // Optional: Set a custom color for the button
            }).then((result) => {
              if (result.isConfirmed) { 
                window.location.href = '../'; // Replace 'blogs.html' with the URL of your blogs page
              } 
            });
          }); 
      })
      .catch(error => {
        console.error("Error fetching blog IDs: ", error);
        
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'The blog you are looking for does not exist!',
          confirmButtonText: 'Go to Blogs', // Text for the button
          confirmButtonColor: '#3085d6' ,
          allowOutsideClick: false, // Prevent closing by clicking outside
  allowEscapeKey: false  // Optional: Set a custom color for the button
        }).then((result) => {
          if (result.isConfirmed) { 
            window.location.href = '../blog/'; // Replace 'blogs.html' with the URL of your blogs page
          } 
        });
      });
  }

  function displayBlogNavigation(previousBlogId, nextBlogId, allBlogIds) {
    const navigationContainer = document.querySelector('.single-post__navigation');

    // Previous Blog
    if (previousBlogId) {
      db.collection('blogs').doc(previousBlogId).get()
        .then(doc => {
          if (doc.exists) {
            const previousBlogData = doc.data();
            const previousBlogElement = createNavigationElement(previousBlogData, 'previous',previousBlogId, allBlogIds);
            navigationContainer.appendChild(previousBlogElement);
          }
        });
    }

    // Next Blog
    if (nextBlogId) {
      db.collection('blogs').doc(nextBlogId).get()
        .then(doc => {
          if (doc.exists) {
            const nextBlogData = doc.data();
            const nextBlogElement = createNavigationElement(nextBlogData, 'next',nextBlogId, allBlogIds);
            navigationContainer.appendChild(nextBlogElement);
          }
        });
    }
  }

  function getNavigationBlogIds(currentBlogId, allBlogIds) {
    const currentIndex = allBlogIds.indexOf(currentBlogId);
    const previousBlogId = currentIndex > 0 ? allBlogIds[currentIndex - 1] : null;
    const nextBlogId = currentIndex < allBlogIds.length - 1 ? allBlogIds[currentIndex + 1] : null;
    return { previousBlogId, nextBlogId };
  }

  function displayRecentBlogs() {
    db.collection("blogs")
      .orderBy("datePosted", "desc")
      .limit(3) // Fetch only the top 3 recent blogs
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const blogData = doc.data();
  
          const recentBlogItem = document.createElement('li');
          
  
          // Create the thumbnail div
          const thumbDiv = document.createElement('div');
          thumbDiv.classList.add('recent-post_thumb');
          const thumbLinkRecent = document.createElement('a');
          thumbLinkRecent.href = `blog.html?id=${doc.id}`; 
          const thumbImage = document.createElement('img');
          thumbImage.src = "../assets/img/blog/postthumb.jpg"; // Use the stored URL
          thumbImage.alt = '';
          thumbLinkRecent.appendChild(thumbImage);
          thumbDiv.appendChild(thumbLinkRecent);
  
          // Create the content div
          const contentDiv = document.createElement('div');
          contentDiv.classList.add('recent-post_content');
  
          // Create the meta div 
          const metaDiv = document.createElement('div');
          metaDiv.classList.add('tj-post__meta', 'entry-meta');
          const dateSpan = document.createElement('span');
          dateSpan.innerHTML = `<i class="fa-light fa-calendar-days"></i> ${new Date(blogData.datePosted.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
          const commentsSpan = document.createElement('span');
          commentsSpan.innerHTML = ``;
          getCommentCount(doc.id)
          .then(commentCount => {
            commentsSpan.innerHTML = `<i class="fa-light fa-comments"></i><a href="#"> (${commentCount})</a>`;
          })
          .catch(error => {
            console.error("Error fetching comment count:", error);
          });
          metaDiv.appendChild(dateSpan);
          metaDiv.appendChild(commentsSpan);
  
          // Create the title h4
          const titleH4 = document.createElement('h4');
          titleH4.classList.add('recent-post_title');
          const titleLink = document.createElement('a');
          titleLink.href = `blog.html?id=${doc.id}`;
          titleLink.textContent = blogData.heading;
          titleH4.appendChild(titleLink);
  
          // Add elements to the content div
          contentDiv.appendChild(metaDiv);
          contentDiv.appendChild(titleH4);
  
          // Add elements to the list item
          recentBlogItem.appendChild(thumbDiv);
          recentBlogItem.appendChild(contentDiv);
  
          // Append the list item to the recent blogs container
          recentBlogsContainer.appendChild(recentBlogItem);
  
          // Load the actual image with onload event (optional, same as before)
          
        });
      })
      .catch((error) => {
        console.error("Error fetching recent blogs: ", error);
      });
  }
  

// Function to create navigation elements
function createNavigationElement(blogData, type, blogId, allBlogIds) {
    const navigationPost = document.createElement('div');
    navigationPost.classList.add('tj-navigation_post', type);
  
    // Create the inner div for the navigation post
    const navigationPostInner = document.createElement('div');
    navigationPostInner.classList.add('tj-navigation-post_inner', `${type}_post`);
  
    // Create link for image and title
    const link = document.createElement('a');
    link.href = `blog.html?id=${blogId}`; 
  
    if (type === 'previous') {
      // Previous post structure
      // Image (with link)
      const imageDiv = document.createElement('div');
      imageDiv.classList.add('navigation-post_img');
      const imageLink = document.createElement('a'); // Create link for the image
      imageLink.href = `blog.html?id=${blogId}`; 
      const image = document.createElement('img');
      image.src = blogData.postThumbImageUrl;
      image.alt = '';
      imageLink.appendChild(image); // Append image to the link
      imageDiv.appendChild(imageLink); // Append image link to the div
      navigationPostInner.appendChild(imageDiv);
  
      // Content 
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('tj-content');
  
      // Pagination Nav (with link)
      const paginationNav = document.createElement('div');
      paginationNav.classList.add('post_pagination_nav');
      const paginationNavLink = document.createElement('a'); // Create link for "previous"
      paginationNavLink.href = `blog.html?id=${blogId}`; 
      paginationNavLink.innerHTML = `<i class="fa-regular fa-angle-double-left"></i>previous`; 
      contentDiv.appendChild(paginationNavLink);
  
      // ... (Your existing code to create and append the title) ... 
  // Title (with link)
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('post_pagination_title');
  const titleLink = document.createElement('a'); 
  titleLink.href = `blog.html?id=${blogId}`; 
  const title = document.createElement('h5');
  title.classList.add('title');
  title.textContent = blogData.heading;
  titleLink.appendChild(title); 
  titleDiv.appendChild(titleLink);
  contentDiv.appendChild(paginationNav);
  contentDiv.appendChild(titleDiv);
  navigationPostInner.appendChild(contentDiv);
      navigationPostInner.appendChild(contentDiv);
    } else if (type === 'next') {
      // Next post structure
      // Content 
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('tj-content');
  
      // Pagination Nav (with link)
      const paginationNav = document.createElement('div');
      paginationNav.classList.add('post_pagination_nav');
      const paginationNavLink = document.createElement('a'); // Create link for "Next"
      paginationNavLink.href = `blog.html?id=${blogId}`; 
      paginationNavLink.innerHTML = `Next<i class="fa-regular fa-angle-double-right"></i>`; 
      contentDiv.appendChild(paginationNavLink);
  
      // ... (Your existing code to create and append the title) ... 
  // Title (with link)
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('post_pagination_title');
  const titleLink = document.createElement('a'); 
  titleLink.href = `blog.html?id=${blogId}`; 
  const title = document.createElement('h5');
  title.classList.add('title');
  title.textContent = blogData.heading;
  titleLink.appendChild(title); 
  titleDiv.appendChild(titleLink);
  contentDiv.appendChild(paginationNav);
  contentDiv.appendChild(titleDiv);
  navigationPostInner.appendChild(contentDiv);
      navigationPostInner.appendChild(contentDiv);
  
      // Image (with link)
      const imageDiv = document.createElement('div');
      imageDiv.classList.add('navigation-post_img');
      const imageLink = document.createElement('a'); // Create link for the image
      imageLink.href = `blog.html?id=${blogId}`; 
      const image = document.createElement('img');
      image.src = blogData.postThumbImageUrl;
      image.alt = '';
      imageLink.appendChild(image); // Append image to the link
      imageDiv.appendChild(imageLink); // Append image link to the div
      navigationPostInner.appendChild(imageDiv);
    }
  
    // Add link and inner div to the main div
    navigationPost.appendChild(navigationPostInner);
  
    return navigationPost;
  }
   
// Function to display comments
function displayComments(blogId) {
  db.collection('blogs').doc(blogId).collection('comments').orderBy('timestamp', 'desc').get()
    .then(querySnapshot => {
      commentList.innerHTML = ''; // Clear existing comments

      // Update comment count
      commentCount.textContent = `(${querySnapshot.size})`;

      querySnapshot.forEach(doc => {
        const commentData = doc.data();
        const commentElement = createCommentElement(commentData);
        commentList.appendChild(commentElement);
      });
    })
    .catch(error => {
      console.error("Error fetching comments: ", error);
    });
}

// Function to create a comment element
function createCommentElement(commentData) {
  const commentItem = document.createElement('li');
  commentItem.classList.add('tj__comment');

  const commentWrap = document.createElement('div');
  commentWrap.classList.add('tj-comment__wrap');

  // Profile picture
  const avatarDiv = document.createElement('div');
  avatarDiv.classList.add('comment__avatar');
  const profilePic = document.createElement('img');
  profilePic.src = commentData.profilePicUrl || '../assets/img/blog/postthumb.jpg';
  profilePic.alt = commentData.name + "'s Profile Picture";
  avatarDiv.appendChild(profilePic);

  // Comment content
  const textDiv = document.createElement('div');
  textDiv.classList.add('comment__text');

  const nameDiv = document.createElement('div');
  nameDiv.classList.add('avatar__name');
  const nameLink = document.createElement('a'); // Optional: Link the name
  nameLink.href = '#'; // Replace with actual profile link if available
  nameLink.textContent = commentData.name;
  const nameHeading = document.createElement('h5');
  nameHeading.appendChild(nameLink);
  const timeSpan = document.createElement('span');
  timeSpan.textContent = new Date(commentData.timestamp.seconds * 1000).toLocaleString();
  nameDiv.appendChild(nameHeading);
  nameDiv.appendChild(timeSpan);

  const commentText = document.createElement('p');
  commentText.textContent = commentData.comment;

  
  textDiv.appendChild(nameDiv);
  textDiv.appendChild(commentText);
 // textDiv.appendChild(replyDiv); // Optional

  commentWrap.appendChild(avatarDiv);
  commentWrap.appendChild(textDiv);
  commentItem.appendChild(commentWrap);

  return commentItem;
}



// Function to handle comment form submission
function handleCommentSubmit(blogId) {
  // Get the comment form elements 
  const commentForm = document.getElementById('comment-form');
  const commentTextInput = document.getElementById('comment-text');

  // Add the event listener to the form
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault(); 

    const user = auth.currentUser;
    if (user) {
      const commentText = commentTextInput.value.trim();

      if (commentText !== "") {
        // Save the comment to Firestore
        db.collection('blogs').doc(blogId).collection('comments').add({
          name: user.displayName,
          profilePicUrl: user.photoURL, 
          comment: commentText,
          timestamp: firebase.firestore.FieldValue.serverTimestamp() 
        })
        .then(() => {
          console.log("Comment added successfully!");
          commentTextInput.value = ''; // Clear the comment input
          displayComments(blogId);
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your comment has been posted.',
            showConfirmButton: false, // Hide the "OK" button
            timer: 1500 // Auto-close the popup after 1.5 seconds 
          }); // Refresh the comments display
        })
        .catch(error => {
          console.error("Error adding comment: ", error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error adding comment!',
             // Optional: Set a custom color for the button
          });
          // Handle the error appropriately (e.g., display an error message)
        });
      }
    } else {
      // User is not signed in, show a message or redirect to login
      console.error("User is not signed in.");
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'User is not signed in.',
         // Optional: Set a custom color for the button
      });
      // You might want to display an error message or redirect to the login page here
    }
  });
}
// Function to get the comment count for a blog
function getCommentCount(blogId) {
  return db.collection('blogs').doc(blogId).collection('comments').get()
    .then(querySnapshot => {
      return querySnapshot.size; 
    });
}

function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.textContent = 'Loading...';
    const blogsContainer = document.getElementById('blog-posts-container');
    blogsContainer.innerHTML = ''; // Clear existing content
    blogsContainer.appendChild(loadingIndicator);
}

function hideLoadingIndicator() {
    const blogsContainer = document.getElementById('blog-posts-container');
    const loadingIndicator = blogsContainer.querySelector('.loading-indicator');
    if (loadingIndicator) {
        blogsContainer.removeChild(loadingIndicator);
    }
}

function loadActualImage(imageUrl, thumbLink) {
    const actualImage = document.createElement('img');
    actualImage.src = imageUrl;
    actualImage.alt = '';
  
    actualImage.onload = () => {
      // Replace the placeholder with the actual image
      thumbLink.replaceChild(actualImage, thumbLink.firstChild); 
    };
  }

 // Function to show a simple preloader for 1 second
function showSimplePreloader() {
  
  displayBlogDetails();
  displayRecentBlogs();


  setTimeout(() => {
    document.getElementById('preloader').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  }, 1000); // Hide after 1 second (1000 milliseconds)
}




  
  // Call preloader when the page loads
document.addEventListener('DOMContentLoaded',showSimplePreloader);