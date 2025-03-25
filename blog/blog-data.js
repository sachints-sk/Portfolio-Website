// Your web app's Firebase configuration
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
const db = firebase.firestore();
const blogPostsContainer = document.getElementById('blog-posts-container');
const recentBlogsContainer = document.getElementById('recent-blogs'); 


// Function to create a blog card
function createBlogCard(blogData,blogid) {
    // Create the main article element
    const blogCard = document.createElement('article');
    blogCard.classList.add('tj-post', 'wow', );
    blogCard.setAttribute('data-wow-delay', '.3s');

    // Create the thumbnail div
    const thumbDiv = document.createElement('div');
    thumbDiv.classList.add('tj-post__thumb');
    const thumbLink = document.createElement('a');
    
    thumbLink.href = `blog.html?id=${blogid}`;  // Adjust href if needed
    const thumbImage = document.createElement('img');
    thumbImage.src = '../assets/img/blog/placeholder.png'; // Replace with actual image source
    thumbImage.alt = '';
    thumbLink.appendChild(thumbImage);
    const categoryLink = document.createElement('a');
    categoryLink.href = `blog.html?id=${blogid}`;  // Adjust href if needed
    categoryLink.classList.add('category');
    categoryLink.textContent = 'Tutorial'; // Replace with actual category
    thumbDiv.appendChild(thumbLink);
    thumbDiv.appendChild(categoryLink);

    // Create the content div
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('tj-post__content');

    // Create the meta div
    const metaDiv = document.createElement('div');
    metaDiv.classList.add('tj-post__meta', 'entry-meta');
    const authorSpan = document.createElement('span');
    authorSpan.innerHTML = `<i class="fa-light fa-user"></i> <a href="#">By Admin</a>`; // Replace with actual author
    const dateSpan = document.createElement('span');
    dateSpan.innerHTML = `<i class="fa-light fa-calendar-days"></i> ${new Date(blogData.datePosted.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
    const commentsSpan = document.createElement('span');
    commentsSpan.innerHTML = `<i class="fa-light fa-comments"></i><a href="#">Comments (3)</a>`; // Replace with actual comment count
    metaDiv.appendChild(authorSpan);
    metaDiv.appendChild(dateSpan);
    metaDiv.appendChild(commentsSpan);

    // Create the title h3
    const titleH3 = document.createElement('h3');
    titleH3.classList.add('tj-post__title', 'entry-title');
    const titleLink = document.createElement('a');
    titleLink.href = `blog.html?id=${blogid}`;  // Adjust href if needed
    titleLink.textContent = blogData.heading;
    titleH3.appendChild(titleLink);

    // Create the excerpt div
    const excerptDiv = document.createElement('div');
    excerptDiv.classList.add('tj-post__excerpt');
    const excerptP = document.createElement('p');
    excerptP.textContent = blogData.introParagraph; // Replace with actual excerpt
    excerptDiv.appendChild(excerptP);

    // Create the button div
    const btnDiv = document.createElement('div');
    btnDiv.classList.add('tj-post__btn');
    const readMoreBtn = document.createElement('a');
    readMoreBtn.href = `blog.html?id=${blogid}`; // Adjust href if needed
    readMoreBtn.classList.add('tj-btn-primary');
    readMoreBtn.textContent = 'Read more';
    btnDiv.appendChild(readMoreBtn);

    // Add content to the content div
    contentDiv.appendChild(metaDiv);
    contentDiv.appendChild(titleH3);
    contentDiv.appendChild(excerptDiv);
    contentDiv.appendChild(btnDiv);

    // Add elements to the main article element
    blogCard.appendChild(thumbDiv);
    blogCard.appendChild(contentDiv);
    loadActualImage(blogData.thumbImageUrl, thumbLink);
    return blogCard;
}

// Fetch and display blogs from Firestore
function displayBlogs() {
    showLoadingIndicator();
    const blogsContainer = document.getElementById('blog-posts-container'); // Use the correct container ID
    db.collection("blogs").orderBy("datePosted", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const blogData = doc.data();
            const blogid=doc.id;
            const blogCard = createBlogCard(blogData,blogid);
            blogsContainer.appendChild(blogCard);
        });
        hideLoadingIndicator();
        
    }).catch((error) => {
        console.error("Error fetching blogs: ", error);
    });
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
          commentsSpan.innerHTML = `<i class="fa-light fa-comments"></i><a href="#"> (3)</a>`;
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

  function showSimplePreloader() {
  
    displayRecentBlogs();
    displayBlogs();
  
  
    setTimeout(() => {
      document.getElementById('preloader').style.display = 'none';
      document.getElementById('content').style.display = 'block';
    }, 1000); // Hide after 1 second (1000 milliseconds)
  }
  



// Display blogs when the page loads
document.addEventListener('DOMContentLoaded', showSimplePreloader);

