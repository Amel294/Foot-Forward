function updateQuantity(itemId, newQuantity, variantId, buttonClicked) {
  const priceElement = document.getElementById(`price-${ itemId }`);
  const price = parseFloat(priceElement.innerText.replace('₹', ''));
  const totalElement = document.getElementById(`total-${ itemId }`);
  const cartTotal = document.getElementById(`cart-total`)
  const discount = document.getElementById(`cart-discount`);
  const grandTotal = document.getElementById(`cart-grandTotal`)



  fetch(`/cart/update-quantity/${ itemId }/${ variantId }/${ buttonClicked }`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity: newQuantity }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById(`quantity-${ itemId }`).value = newQuantity;
        totalElement.innerHTML = `₹${ data.newTotal }`;
        discount.innerHTML = `-₹${ data.discount }`;
        grandTotal.innerHTML = `₹${ data.grandTotal }`
        cartTotal.innerHTML = `₹${ data.cartTotal }`
        Swal.fire({
          title: 'Success!',
          text: data.message || 'Quantity updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Failed!',
          text: data.message || 'Quantity update failed',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update quantity',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    });
}



// Event listeners for plus and minus buttons
document.querySelectorAll('.quantity-left-minus, .quantity-right-plus').forEach(button => {
  button.addEventListener('click', function () {
    const itemId = this.dataset.field; // Using data-field attribute as per your EJS
    const variantId = this.dataset.vaientid;
    const input = document.getElementById(`quantity-${ itemId }`);
    let newQuantity = parseInt(input.value);
    let buttonClicked = ""; // Variable to
    if (this.classList.contains('quantity-left-minus')) {
      newQuantity = Math.max(newQuantity - 1, 1); // Decrement quantity, but not below 1
      buttonClicked = "minus";
    } else if (this.classList.contains('quantity-right-plus')) {
      newQuantity = Math.min(newQuantity + 1, 10); // Increment quantity, but not above 10
      buttonClicked = "plus";
    }
    updateQuantity(itemId, newQuantity, variantId, buttonClicked);
  });
});

// Function to remove an item from the cart
// Function to remove an item from the cart
function removeItemFromCart(itemId) {
  const priceElement = document.getElementById(`price-${ itemId }`);
  const price = parseFloat(priceElement.innerText.replace('₹', ''));
  const totalElement = document.getElementById(`total-${ itemId }`);
  const discount = document.getElementById(`cart-discount`);
  const grandTotal = document.getElementById(`cart-grandTotal`)
  const cartTotal = document.getElementById(`cart-total`)

  fetch(`/cart/remove/${ itemId }`, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(`Discount is ${ data.total }`)
        // Remove the item row from the table
        document.getElementById(`item-row-${ itemId }`).remove();
        cartTotal.innerHTML = `₹${ data.total }`
        discount.innerHTML = `₹${ data.discount }`;
        grandTotal.innerHTML = `₹${ data.grandTotal }`
        // Fetch and update the cart's total after the item has been removed
      } else {
        // Handle error
        alert('Could not remove the item');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


function enforceMaxValue(input, maxValue) {
  const value = parseInt(input.value, 10); // Parse the input value as an integer

  // Check if the value exceeds the maximum allowed value
  if (isNaN(value) || value > maxValue) {
    // Reset the input value to the maximum allowed value
    input.value = maxValue;
  }
}


// Attach event listeners to remove item buttons
document.querySelectorAll('.remove-item').forEach(button => {
  button.addEventListener('click', function (event) {
    event.preventDefault();
    const itemId = this.dataset.itemId;
    removeItemFromCart(itemId);
  });
});

// Call fetchAndUpdateCartTotal on page load to ensure totals are correct
document.addEventListener('DOMContentLoaded', fetchAndUpdateCartTotal, updateQuantity);






document.addEventListener('DOMContentLoaded', function () {
  // Get a reference to the "Proceed to Checkout" link
  const checkoutLink = document.querySelector('.checkout-button');

  // Add a click event listener to the link
  checkoutLink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default link behavior (navigating to /checkout)

    // Get the product IDs from the table rows
    const productIds = Array.from(document.querySelectorAll('tr[data-productID]')).map(row => row.getAttribute('data-productID'));
    const variantIds = Array.from(document.querySelectorAll('tr[data-variantID]')).map(row => row.getAttribute('data-variantID'));
    const quantities = Array.from(document.querySelectorAll('input[name="quantity"]')).map(input => input.value);

    console.log(productIds);
    console.log(variantIds);
    console.log(quantities);

    // Make a fetch request to the /checkout endpoint with the product IDs in the request body
    fetch('/checkCart', {
      method: 'POST', // Use POST to send data in the request body
      headers: {
        'Content-Type': 'application/json',
        // Include any other headers as required
      },
      body: JSON.stringify({ productIds, variantIds, quantities }), // Send the product IDs in the request body
    })
      .then(response => {
        if (response.ok) {
          console.log("Response id OK");
          return response.json();
        } else {
          // Handle any error response here
          return response.json().then(data => {
            return Promise.reject(data);
          });
        }
      })
      .then(data => {
        // Handle success, e.g., show a success message
        Swal.fire({
          title: 'Success!',
          text: 'Cart is valid. Redirecting to checkout...',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          // Redirect to the /checkout page
          window.location.href = '/checkout';
        });
      })

      .catch(error => {
        // Handle any error, e.g., show an error message
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Something went wrong.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      });
  });
});



