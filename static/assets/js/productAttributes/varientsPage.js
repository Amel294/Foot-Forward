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
                <select class="form-select js-select2" data-search="on" id="${ colorDropdownId }" name="color">
                    <!-- Colors will be populated here using JavaScript -->
                </select>
            </div>
            
            <!-- Size Dropdown -->
            <div class="col-md-4">
                <select class="form-select js-select2" data-search="on" id="${ sizeDropdownId }" name="size">
                    <!-- Sizes will be populated here using JavaScript -->
                </select>
            </div>
            
            <!-- Stock Input -->
            <div class="col-md-4">
                <input type="text" class="form-control" id="${ stockInputId }" placeholder="Enter stock quantity" name="stock">
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




document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('productForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Create a new FormData object
        const formData = new FormData(form);

        // Add the dynamically generated variants to the FormData
        const variants = [];
        const variantElements = document.querySelectorAll('.preview-list > div');
        variantElements.forEach(variantElement => {
            const colorId = variantElement.querySelector('[name="color"]').value;
            const sizeId = variantElement.querySelector('[name="size"]').value;
            const stock = parseInt(variantElement.querySelector('[name="stock"]').value, 10);

            variants.push({
                color: {
                    _id: colorId,
                    ref: 'Color'
                },
                size: {
                    _id: sizeId,
                    ref: 'Size'
                },
                stock: stock
            });
        });

        // Add the variants to the FormData
        formData.append('variants', JSON.stringify(variants));

        // Send the FormData to the server
        try {
            const response = await fetch('http://localhost:3000/admin/addProduct', {
                method: 'POST',
                body: formData  // Use formData here
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



