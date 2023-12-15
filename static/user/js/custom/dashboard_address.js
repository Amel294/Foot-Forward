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
    fetch('/user/add-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);

        if (data.success) {
          hideAddAddressModal(); // Hide the modal after successful submission
          // Clear the input fields
          $('#fullName').val('');
          $('#street').val('');
          $('#city').val('');
          $('#state').val('');
          $('#zipCode').val('');
          $('#mobile').val('');

          // Show SweetAlert success message
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'New address saved successfully!',
          });

          // Reload the page
          window.location.reload();
        } else {
          // Show SweetAlert error message
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error saving address',
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);

        // Show SweetAlert error message
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error saving address',
        });
      });
  });
});

document.addEventListener('DOMContentLoaded', (event) => {
  // ... (your existing code)

  // Handle form submission
  document.getElementById('editForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fieldValue = document.getElementById('editInput').value;
    const fieldType = document.getElementById('fieldType').value;

    fetch('/user/add-address', {
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

        // Show SweetAlert success message
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Address updated successfully!',
        });

        // Redirect to /checkout after the modal has hidden
        $('#editModal').on('hidden.bs.modal', function (e) {
          console.log("trying to redirect ");
          window.location.reload();         })
      })
      .catch((error) => {
        console.error('Error:', error);

        // Show SweetAlert error message
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error updating address',
        });
      });
  });
});
