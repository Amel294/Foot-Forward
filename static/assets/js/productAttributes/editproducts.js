  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.delete-image-btn').forEach(button => {
      button.addEventListener('click', function() {
        this.parentElement.classList.toggle('marked-for-deletion');
      });
    });
  });




  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');
    form.addEventListener('submit', function(event) {
      event.preventDefault();
  
      // Create a FormData object from the form
      const formData = new FormData(this);
      const formDataObj = {};
  
      // Convert FormData into a plain object
      for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
      }
  
      // Handle marked-for-deletion images
      const deletedImages = [];
      document.querySelectorAll('.image-container.marked-for-deletion').forEach(container => {
        const imageId = container.querySelector('.delete-image-btn').getAttribute('data-image-id');
        deletedImages.push(imageId);
      });
  
      // Add deletedImages array to formDataObj
      formDataObj.deletedImages = deletedImages;
  
      console.log("Form data object is", formDataObj);
  
      // Send the PUT request with the formDataObj
      fetch('/admin/update-product', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObj)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        // Handle success - Redirect or show a message
        // Example: window.location.href = '/success-page';
      })
      .catch((error) => {
        console.error('Error:', error);
        // Handle error
        // Example: alert('An error occurred');
      });
    });
  });
  


// Add this JavaScript code to your page
document.addEventListener('DOMContentLoaded', function () {
  const orderItems = document.querySelectorAll('.order-item');

  orderItems.forEach(function (orderItem) {
    orderItem.addEventListener('click', function () {
      const orderId = this.getAttribute('data-order-id');
      const orderItemsList = document.querySelector(`.order-items-list[data-order-id="${orderId}"]`);

      if (orderItemsList) {
        orderItemsList.classList.toggle('active');
      }
    });
  });
});
