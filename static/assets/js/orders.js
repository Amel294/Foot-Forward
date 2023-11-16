// JavaScript to open the modal and populate variants when "Update Stock" is clicked
document.querySelectorAll('.update-stock-button').forEach(function(button) {
    button.addEventListener('click', function() {
        const productId = button.dataset.productId;
        const productVariants = getProductVariants(productId); // Implement this function to get variants
        populateVariantTable(productVariants);
        $('#updateStockModal').modal('show');
    });
});

// JavaScript to handle the "Update" button click within the modal
document.getElementById('updateStockButton').addEventListener('click', function() {
    const newStock = document.getElementById('newStock').value;
    // Update the product's variants with the new stock value here
    // You'll need to implement this part to update the database.
    // You can send an AJAX request or use a server-side API to update the stock in the database.
    // Remember to update the variant table in the modal accordingly.
    // After updating, you can close the modal: $('#updateStockModal').modal('hide');
});

// Function to populate the variant table in the modal
function populateVariantTable(variants) {
    const tableBody = document.getElementById('variantTableBody');
    tableBody.innerHTML = '';
    variants.forEach(function(variant) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${variant.color.name}</td>
            <td>${variant.size.value}</td>
            <td>${variant.stock}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to retrieve product variants (You need to implement this)
function getProductVariants(productId) {
    // You should implement this function to fetch the product's variants based on productId.
    // This function should return an array of variant objects.
    // Example:
    // return [
    //     { color: { name: 'Red' }, size: { value: 'S' }, stock: 10 },
    //     { color: { name: 'Blue' }, size: { value: 'M' }, stock: 15 },
    //     // Add more variants here
    // ];
}
