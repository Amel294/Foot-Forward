 // Function to fetch and update the cart's total from the server
 function fetchAndUpdateCartTotal() {
    fetch('/cart/total', {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      console.log('Cart total response:', data); // Debugging log
      // Assuming you have an element with the id 'cart-total' for the total price
      const totalElement = document.getElementById('cart-total');
      if (totalElement) {
        totalElement.innerText = `₹${parseFloat(data.total).toFixed(2)}`;
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  
  
    // Function to update the quantity in the input field and send an update request
    function updateQuantity(itemId, newQuantity) {
      const priceElement = document.getElementById(`price-${itemId}`);
      const price = parseFloat(priceElement.innerText.replace('₹', ''));
      const totalElement = document.getElementById(`total-${itemId}`);
      
      fetch(`/cart/update-quantity/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update the UI accordingly
          document.getElementById(`quantity-${itemId}`).value = newQuantity;
          // Update the total price for the item
          if (totalElement) {
            const itemTotalPrice = (price * newQuantity).toFixed(2);
            totalElement.innerText = `₹${itemTotalPrice}`;
          }
          // Fetch and update the cart's total
          fetchAndUpdateCartTotal();
        } else {
          // Handle error, maybe revert the quantity change in the input
          alert('Quantity update failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
    
    // Event listeners for plus and minus buttons
    document.querySelectorAll('.quantity-left-minus, .quantity-right-plus').forEach(button => {
      button.addEventListener('click', function() {
        const itemId = this.dataset.field; // Using data-field attribute as per your EJS
        const input = document.getElementById(`quantity-${itemId}`);
        let newQuantity = parseInt(input.value);
        if (this.classList.contains('quantity-left-minus')) {
          newQuantity = newQuantity > 1 ? newQuantity - 1 : 1; // Prevent quantity from going below 1
        } else {
          newQuantity = newQuantity < 10 ? newQuantity + 1 : 10; // Prevent quantity from going above 10
        }
        updateQuantity(itemId, newQuantity);
      });
    });
    
  // Function to remove an item from the cart
  // Function to remove an item from the cart
  function removeItemFromCart(itemId) {
    fetch(`/cart/remove/${itemId}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Remove the item row from the table
        document.getElementById(`item-row-${itemId}`).remove();
        // Fetch and update the cart's total after the item has been removed
        fetchAndUpdateCartTotal();
      } else {
        // Handle error
        alert('Could not remove the item');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  
  
    
    // Attach event listeners to remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', function(event) {
        event.preventDefault();
        const itemId = this.dataset.itemId;
        removeItemFromCart(itemId);
        fetchAndUpdateCartTotal();
      });
    });
    
    // Call fetchAndUpdateCartTotal on page load to ensure totals are correct
    document.addEventListener('DOMContentLoaded', fetchAndUpdateCartTotal,updateQuantity);