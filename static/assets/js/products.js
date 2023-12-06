

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', function() {
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });
});


function updateStock(variantId) {
    const stockInput = document.getElementById(`stock-${variantId}`);
    const newStock = stockInput.value;

    // Make a POST request to update the stock in MongoDB
    fetch('/admin/api/updateStock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            variantId: variantId,
            newStock: newStock,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the UI with the new stock value
            const currentStockSpan = document.getElementById(`current-stock-${variantId}`);
            if (currentStockSpan) {
                currentStockSpan.textContent = `Current Stock: ${data.newStock}`;
            }
            alert('Stock updated successfully');
        } else {
            alert('Failed to update stock');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

