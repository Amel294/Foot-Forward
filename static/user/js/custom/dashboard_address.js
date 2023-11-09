$(document).ready(function () {
  // Function to show the modal
  function showAddAddressModal() {
    $('#add_new_address').show();
  }

  // Function to hide the modal
  function hideAddAddressModal() {
    $('#add_new_address').hide();
  }

  // When the "Add New Address" button is clicked, show the modal
  $('#addNewAddressButton').click(showAddAddressModal);

  // When the close button (x) is clicked, hide the modal
  $('#closeModal').click(hideAddAddressModal);

  // When the save button is clicked, submit the address data
  $('#saveAddress').click(function (event) {
    event.preventDefault(); // Prevent the default form submission

    var fullName = $('#fullName').val();
    var street = $('#street').val();
    var city = $('#city').val();
    var state = $('#state').val();
    var zipCode = $('#zipCode').val();
    var mobile = $('#mobile').val();

    var data = {
      fullName: fullName,
      address: {
        street: street,
        city: city,
        state: state,
        zipCode: zipCode
      },
      mobile: mobile
    };

    console.log('Submitting data', data);

    // Using fetch to send the data
    fetch('http://localhost:3000/user/add-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        hideAddAddressModal(); // Hide the modal after successful submission
        // Clear the input fields
        $('#fullName').val('');
        $('#street').val('');
        $('#city').val('');
        $('#state').val('');
        $('#zipCode').val('');
        $('#mobile').val('');
      })
      .catch((error) => {
        console.error('Error:', error);
        // Handle the error here, maybe show a message to the user
      });
  });
});




document.addEventListener('DOMContentLoaded', (event) => {
  // Open modal with dynamic content
  document.querySelectorAll('[data-bs-toggle="modal"]').forEach(item => {
    item.addEventListener('click', event => {
      const fieldType = item.getAttribute('data-field-type');
      const currentValue = item.getAttribute('data-current-value');
      const modalLabel = document.getElementById('editModalLabel');
      const editInput = document.getElementById('editInput');
      const fieldTypeInput = document.getElementById('fieldType');

      // Update modal based on the data attributes
      modalLabel.textContent = `Edit ${ fieldType.charAt(0).toUpperCase() + fieldType.slice(1) }`;
      editInput.value = currentValue;
      editInput.name = fieldType;
      fieldTypeInput.value = fieldType;

      // Set proper input type for password field
      editInput.type = fieldType === 'password' ? 'password' : 'text';

      // Change the label for the input
      document.querySelector('label[for="editInput"]').textContent = `${ fieldType.charAt(0).toUpperCase() + fieldType.slice(1) }:`;
    });
  });

  // Handle form submission
  document.getElementById('editForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fieldValue = document.getElementById('editInput').value;
    const fieldType = document.getElementById('fieldType').value;

    fetch('http://localhost:3000/user/add-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${ response.status }`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        
      
        // Close the modal
        $('#editModal').modal('hide');
        // Redirect to /checkout after the modal has hidden
        $('#editModal').on('hidden.bs.modal', function (e) {
          console.log("trtying tio redirect ");
          window.location.href = '/checkout'; // Redirect to the checkout route
        })
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});

