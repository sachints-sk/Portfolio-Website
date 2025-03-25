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

// Function to create a blog card
function createBlogCard(blogData) {
    const blogCard = document.createElement('div');
    blogCard.classList.add('blog-card');

    const date = document.createElement('div');
    date.classList.add('date');
    date.textContent = `Posted on: ${new Date(blogData.datePosted.seconds * 1000).toLocaleDateString()}`;
    blogCard.appendChild(date);

    const heading = document.createElement('h2');
    heading.textContent = blogData.heading;
    blogCard.appendChild(heading);

    const introParagraph = document.createElement('p');
    introParagraph.textContent = blogData.introParagraph;
    blogCard.appendChild(introParagraph);

    blogData.content.forEach(section => {
        if (section.subHeading) {
            const subHeading = document.createElement('h3');
            subHeading.textContent = section.subHeading;
            blogCard.appendChild(subHeading);
        }

        const paragraph = document.createElement('p');
        paragraph.textContent = section.paragraph;
        blogCard.appendChild(paragraph);
    });

    const conclusion = document.createElement('p');
    conclusion.textContent = blogData.conclusion;
    blogCard.appendChild(conclusion);

    return blogCard;
}

// Fetch and display blogs from Firestore
function displayBlogs() {
    const blogsContainer = document.getElementById('blogsContainer');
    db.collection("blogs").orderBy("datePosted", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const blogData = doc.data();
            const blogCard = createBlogCard(blogData);
            blogsContainer.appendChild(blogCard);
        });
    }).catch((error) => {
        console.error("Error fetching blogs: ", error);
    });
}

// Display blogs when the page loads
document.addEventListener('DOMContentLoaded', displayBlogs);
