function populateSizes(sizes) {
    const $container = $('#sizeContainer'); // The container where size cards will be appended

    sizes.forEach(sizeObj => {
        const sizeValue = sizeObj.value; // Accessing the value property of size object
        const sizeElement = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                <div class="card custom-card">
                    <div class="card-body d-flex align-items-center justify-content-center">
                        <div class="d-flex align-items-center justify-content-between w-100">
                            <span class="size h6">${sizeValue}</span>
                            <div class="d-flex align-items-center gap-2">
                                <a href="#" class="btn btn-icon btn-trigger me-n1 editSizeBtn" data-size-id="${sizeObj._id}" data-size-value="${sizeValue}">
                                    <em class="icon ni ni-edit icon_size"></em>
                                </a>
                                <a href="#" class="btn btn-icon btn-trigger me-n1 deleteSizeBtn" data-size-id="${sizeObj._id}">
                                    <em class="icon ni ni-trash-empty icon_size"></em>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $container.append(sizeElement);
    });
}



// AJAX call to fetch sizes
$(document).ready(function() {
    console.log("fetchSizes called");

    $.ajax({
        url: 'http://localhost:3000/attributes/sizes',
        type: 'GET',
        dataType: 'json',
        success: function(sizes) {
            populateSizes(sizes);
        },
        error: function(error) {
            console.error('Error fetching sizes:', error);
        }
    });
});

// Handle the deletion of sizes
$(document).on('click', '.deleteSizeBtn', function() {
    const sizeId = $(this).data('size-id');
    $.ajax({
        url: `http://localhost:3000/attributes/sizes/${sizeId}`,
        type: 'DELETE',
        dataType: 'json',
        success: function(response) {
            console.log('Size deleted:', response);
            // Refresh the sizes list in the UI
            fetchSizes();
        },
        error: function(error) {
            console.error('Error deleting size:', error);
        }
    });
});

function fetchSizes() {
    $.ajax({
        url: 'http://localhost:3000/attributes/sizes',
        type: 'GET',
        dataType: 'json',
        success: function(sizes) {
            // Clear the existing sizes from the UI
            $('#sizeContainer').empty();

            // Populate the UI with the fetched sizes
            populateSizes(sizes);
        },
        error: function(error) {
            console.error('Error fetching sizes:', error);
        }
    });
}

// Button to open the modal
$(document).on('click', '#addSizeTrigger', function(e) {
    e.preventDefault();
    $('#addSizeModal').modal('show');
});

// Button to submit the size
$('#submitSizeBtn').click(function() {
    const sizeValue = Number($('#newSizeValue').val());

    if (sizeValue) {
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/attributes/sizes',
            data: { size: sizeValue },  // Send as form data
            success: function(response) {
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error adding size:', textStatus, errorThrown);
                console.error('Server response:', jqXHR.responseText);
            }
        });
    } else {
        alert('Please enter a size value');
    }
});



$(document).on('click', '.editSizeBtn', function(e) {
    e.preventDefault();
    
    const sizeId = $(this).data('size-id');
    const sizeValue = $(this).data('size-value');
    
    $('#editSizeValue').val(sizeValue); // Set the input field with the current size value
    
    $('#updateSizeBtn').data('size-id', sizeId); // Store the size ID to the update button for further use

    $('#editSizeModal').modal('show'); // Show the modal
});


$('#updateSizeBtn').click(function() {
    console.log("Update button clicked!");
    const sizeId = $(this).data('size-id'); // Retrieve the size ID stored earlier
    console.log("Size ID:", sizeId);
    const updatedSizeValue = $('#editSizeValue').val();
    console.log("Sending updated size value:", updatedSizeValue);
    
    $.ajax({
        url: `http://localhost:3000/attributes/sizes/${sizeId}`,
        type: 'PUT',
        data: {
            size: updatedSizeValue
        },
        success: function(updatedSize) {
            console.log('Size updated:', updatedSize);
            $('#editSizeModal').modal('hide'); // Hide the modal
            fetchSizes(); // Refresh the sizes list in the UI
        },
        error: function(error) {
            console.error('Error updating size:', error);
        }
    });
});
