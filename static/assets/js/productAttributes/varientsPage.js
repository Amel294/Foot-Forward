let selectedCombinations = [];
let variantCounter = 1;
let colors = [];  // Ensure this is defined at the top level
let sizes = [];   // Ensure this is defined at the top level

$(document).ready(function () {
    fetchColorsAndSizes();
    $('#addVariantBtn').click(addVariantField);
});

function fetchColorsAndSizes() {
    $.ajax({
        url: 'http://localhost:3000/attributes/colors',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            colors = data;  // Update the colors variable here
            populateColors(colors);
            fetchSizes();
        },
        error: function (error) {
            console.error('Error fetching colors:', error);
        }
    });
}

function fetchSizes() {
    $.ajax({
        url: 'http://localhost:3000/attributes/sizes',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            sizes = data;  // Update the sizes variable here
            populateSizes(sizes);
        },
        error: function (error) {
            console.error('Error fetching sizes:', error);
        }
    });
}

function createVariantField(counter) {
    const colorDropdownId = 'colorDropdown' + counter;
    const sizeDropdownId = 'sizeDropdown' + counter;
    const stockInputId = 'stockInput' + counter;

    const variantFieldHTML = `
    <div class="col-md-12 mt-2">
    <div class="form-control-wrap">
        <div class="row">
            <!-- Color Dropdown -->
            <div class="col-md-4">
                <select class="form-select js-select2" data-search="on" id="${colorDropdownId}" name="color">
                    <!-- Colors will be populated here using JavaScript -->
                </select>
            </div>
            
            <!-- Size Dropdown -->
            <div class="col-md-4">
                <select class="form-select js-select2" data-search="on" id="${sizeDropdownId}" name="size">
                    <!-- Sizes will be populated here using JavaScript -->
                </select>
            </div>
            
            <!-- Stock Input -->
            <div class="col-md-4">
                <input type="text" class="form-control" id="${stockInputId}" placeholder="Enter stock quantity" name="stock">
            </div>
        </div>
    </div>
</div>
    `;

    // Append the new variant field to the beginning of the .preview-list
    $('.preview-list').prepend(variantFieldHTML);

    // Populate the dropdowns
    populateColors(colors, '#' + colorDropdownId);
    populateSizes(sizes, '#' + sizeDropdownId);
}


function addVariantField() {
    createVariantField(variantCounter);
    variantCounter++;
}

function populateColors(colors, selector) {
    const dropdown = $(selector);
    dropdown.empty();
    colors.forEach(color => {
        dropdown.append(`<option value="${ color._id }" data-color="${ color.hex }">${ color.name }</option>`);
    });
}

function populateSizes(sizes, selector) {
    const dropdown = $(selector);
    dropdown.empty();
    sizes.forEach(size => {
        dropdown.append(`<option value="${ size._id }">${ size.value }</option>`);
    });
}

// Event listeners for dropdown items
$(document).on('click', '.dropdown-menu a', function (event) {
    event.preventDefault();
    const dropdownButton = $(this).closest('.dropdown').find('.dropdown-toggle');
    dropdownButton.text($(this).text());
    // Additional logic can be added here if needed
});




document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert('Form submitted!'); // Add this line
        // Capture the main product details
        const productData = {
            brand: form.brand.value,
            name: form.name.value,
            price: form.price.value,
            trending: form.trending.checked,
            productId: form.productId.value,
            category: form.category.value,
            subcategory: form.subcategory.value,
            description: form.description.value,
            images: form.images.files,
            variants: []
        };

        // Capture the dynamically generated variants
        const variantElements = document.querySelectorAll('.preview-list > div');
        variantElements.forEach(variantElement => {
            const color = variantElement.querySelector('[name="color"]').value;
            const size = variantElement.querySelector('[name="size"]').value;
            const stock = variantElement.querySelector('[name="stock"]').value;

            productData.variants.push({
                color,
                size,
                stock
            });
        });

        // Send the structured product data to the server
        try {
            const response = await fetch('/path-to-server-endpoint', { // Replace '/path-to-server-endpoint' with the actual server endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            const responseData = await response.json();
            if (response.ok) {
                alert('Product saved successfully!');
            } else {
                alert('Error saving product: ' + responseData.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving the product.');
        }
    });
});
