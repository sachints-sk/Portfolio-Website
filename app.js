async function incrementVisitorCount() {
  try {
      // Call your Cloud Function endpoint
      const response = await fetch('https://updatevisitorcount-860179840435.asia-south1.run.app');
      const data = await response.json();

      if (data.count !== undefined) {
          // Update the count on the page
          displayVisitorCount(data.count);
      } else {
          console.error("No count returned from Cloud Function");
      }
  } catch (error) {
      console.error('Error calling visitor count Cloud Function:', error);
  }
}

function displayVisitorCount(count) {
  const countDisplayElement = document.getElementById('visitor-count');
  if (countDisplayElement) {
      countDisplayElement.textContent = count;
      countDisplayElement.setAttribute('data-count', count);
  } else {
      console.error("Element with ID 'visitor-count' not found.");
  }
}

// Call the function when the page loads
incrementVisitorCount();
