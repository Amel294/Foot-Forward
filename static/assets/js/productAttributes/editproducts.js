


document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.delete-image-btn').forEach(button => {
    button.addEventListener('click', function () {
      this.parentElement.classList.toggle('marked-for-deletion');
    });
  });
});




document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('productForm');
  form.addEventListener('submit', function (event) {
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
      .then(response => {
        console.log(response);
        console.log("Fetch response:", response);
        return response.json();
      })
      .then(data => {
        Swal.fire({
          title: 'Success!',
          text: 'Product Updated.',
          icon: 'success',
          confirmButtonText: 'OK'
        })
        .then(() => {
          // Redirect to /admin/products after clicking OK
          window.location.href = '/admin/products';
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        // Handle error
      });
  });
});



// Add this JavaScript code to your page
document.addEventListener('DOMContentLoaded', function () {
  const orderItems = document.querySelectorAll('.order-item');

  orderItems.forEach(function (orderItem) {
    orderItem.addEventListener('click', function () {
      const orderId = this.getAttribute('data-order-id');
      const orderItemsList = document.querySelector(`.order-items-list[data-order-id="${ orderId }"]`);

      if (orderItemsList) {
        orderItemsList.classList.toggle('active');
      }
    });
  });
})
