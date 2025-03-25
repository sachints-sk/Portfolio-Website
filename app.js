// Your web app's Firebase configuration



 const firebaseConfig = {
apiKey: "AIzaSyBzcuU7_U9H0C8tGA9UgKj5B8hvHT3w4s4",
authDomain: "adept-ethos-432515-v9.firebaseapp.com",
projectId: "adept-ethos-432515-v9",
storageBucket: "adept-ethos-432515-v9.appspot.com",
messagingSenderId: "860179840435",
appId: "1:860179840435:web:91bf20d35124d57b7d1fc6",
measurementId: "G-6R48NH2L09"
};

// 3. Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// 4. Initialize Firebase Analytics (Namespace format)
firebase.analytics();

// Now you can use the namespace format to log events and other data. 
// For example, to log a page view:

firebase.analytics().logEvent('page_view', {
    page_title: 'Portfolio',
    page_location: '/' 
});


// Reference to the visitor count document
const visitorCountRef = db.collection('siteData').doc('visitorCount'); 


// Function to increment the visitor count and store location
async function incrementVisitorCount() {
    try {
      // Get user's IP and location using a geolocation API
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
  
      const visitorIP = data.ip;
      const visitTime = new Date(); 
      const visitorLocation = {
        country: data.country_name,
        region: data.region,
        city: data.city,
        provider: data.org,
        visitTime: visitTime 
      };
  
      // Transaction to ensure atomicity
      await db.runTransaction(async (transaction) => {
        const visitorCountDoc = await transaction.get(visitorCountRef);
  
        // Define visitorData object to store IP and location as key-value pairs
        let visitorData = {}; 
        let currentCount = 0;
  
        if (visitorCountDoc.exists) {
          // If the document exists, get the current data
          currentCount = visitorCountDoc.data().count || 0;
          visitorData = visitorCountDoc.data().visitorData || {};
        }
  
        // Check if IP address is already recorded
        if (!visitorData[visitorIP]) {
          // Add IP and location to visitorData
          visitorData[visitorIP] = visitorLocation;
  
          transaction.set(visitorCountRef, {
            count: currentCount + 1,
            visitorData: visitorData 
          });
        }
      });
  
      console.log('Visitor count incremented!');
  
    } catch (error) {
      console.error('Error incrementing visitor count:', error);
    }

    displayVisitorCount()  
  }
  

  async function displayVisitorCount() {
    try {
      const visitorCountDoc = await visitorCountRef.get();
  
      if (visitorCountDoc.exists) {
        const visitorCount = visitorCountDoc.data().count || 0; // Get count, default to 0 if not present
        const countDisplayElement = document.getElementById('visitor-count');
        countDisplayElement.textContent = visitorCount; // Your HTML element to display the count
        
        if (countDisplayElement) {
            countDisplayElement.setAttribute('data-count', visitorCount); 
        } else {
          console.error("Element with ID 'visitor-count' not found.");
        }
      } else {
        console.log('Visitor count document does not exist.');
      }
    } catch (error) {
      console.error("Error fetching visitor count: ", error);
    }
  }
  // Call the function when the page loads
  incrementVisitorCount();