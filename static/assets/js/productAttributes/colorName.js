console.log("inside sizesNames")
function populateColors(colors) {
    const $container = $('#colorContainer');

    colors.forEach(color => {
        const colorElement = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                <div class="card custom-card">
                    <div class="card-body d-flex align-items-center justify-content-center">
                        <div class="d-flex align-items-center justify-content-between w-100">
                            <div class="d-flex align-items-center gap-2">
                                <div class="user-avatar" style="background-color: ${color.hex}"><span></span></div>
                                <span class="color-name h6">${color.name}</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <a href="#" class="btn btn-icon btn-trigger me-n1 editColorBtn" data-color-id="${color._id}" data-color-name="${color.name}" data-color-hex="${color.hex}">
                                    <em class="icon ni ni-edit icon_size"></em>
                                </a>
                                <a href="#" class="btn btn-icon btn-trigger me-n1 deleteColorBtn" data-color-id="${color._id}">
                                    <em class="icon ni ni-trash-empty icon_size"></em>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $container.append(colorElement);
    });
}


$(document).ready(function() {
    $.ajax({
        url: 'http://localhost:3000/attributes/colors',
        type: 'GET',
        dataType: 'json',
        success: function(colors) {
            console.log("Fetched colors:", colors);  // Add this line

            populateColors(colors);
        },
        error: function(error) {
            console.error('Error fetching colors:', error);
        }
    });
});

$(document).on('click', '.deleteColorBtn', function() {
    const colorId = $(this).data('color-id');
    $.ajax({
        url: `http://localhost:3000/attributes/colors/${colorId}`,
        type: 'DELETE',
        dataType: 'json',
        success: function(response) {
            console.log('Color deleted:', response);
            populateColors(colors);
        },
        error: function(error) {
            console.error('Error deleting color:', error);
        }
    });
});

$('#addColorBtn').click(function() {
    const colorName = $('#newColorName').val();
    const colorHex = $('#newColorHex').val();
    if (colorName && colorHex) {
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/attributes/colors',
            data: { name: colorName, hex: colorHex },
            success: function(response) {
                if (response.message === 'Color name or HEX code already exists.') {
                    alert('Color name or HEX code already exists.');
                } else {
                    location.reload();
                }
            },
            error: function(error) {
                console.error('Error adding color:', error);
            }
        });
    } else {
        alert('Please enter a color name and hex value');
    }
});




// Show the Add Color Modal when the plus button is clicked
$(document).on('click', '#addColorTrigger', function(e) {
    console.log('Add color button clicked');
    var colorName = $('#newColorName').val().trim();
    var colorHex = $('#newColorHex').val().trim();
    e.preventDefault();
    $('#addColorModal').modal('show');
});




// Show the Edit Color Modal when the edit button is clicked
$(document).on('click', '.editColorBtn', function(e) {
    e.preventDefault();
    
    const colorId = $(this).data('color-id');
    const colorName = $(this).data('color-name');
    const colorHex = $(this).data('color-hex');
    
    $('#editColorName').val(colorName);
    $('#editColorHex').val(colorHex);
    
    $('#updateColorBtn').data('color-id', colorId); // Store the color ID to the update button for further use

    $('#editColorModal').modal('show');
});

// Handle the color update when the "Update" button inside the modal is clicked
$('#updateColorBtn').click(function() {
    const colorId = $(this).data('color-id');
    const colorName = $('#editColorName').val();
    const colorHex = $('#editColorHex').val();
    
    $.ajax({
        url: `http://localhost:3000/attributes/colors/${colorId}`,
        type: 'PUT',
        data: {
            name: colorName,
            hex: colorHex
        },
        success: function(updatedColor) {
            console.log('Color updated:', updatedColor);
            // Close the modal
            $('#editColorModal').modal('hide');
            // Refresh the colors list in the UI
            location.reload(); // or you can call fetchColors() if you have it implemented.
        },
        error: function(error) {
            console.error('Error updating color:', error);
        }
    });
});


