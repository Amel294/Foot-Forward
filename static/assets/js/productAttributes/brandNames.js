function populateBrands(brands) {
    const $container = $('#brandContainer'); // The container where brand cards will be appended

    brands.forEach(brand => {
        const brandElement = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                <div class="card custom-card">
                    <div class="card-body d-flex align-items-center justify-content-center">
                        <div class="d-flex align-items-center justify-content-between w-100">
                            <div class="d-flex align-items-center gap-2">
                                <div class="user-avatar bg-primary-dim"><span>${brand.name.substring(0, 2).toUpperCase()}</span></div>
                                <span class="color-name h6">${brand.name}</span>
                            </div>
                            <!-- Edit Button -->
                            <a href="#" class="btn btn-icon btn-trigger me-n1 editBtn" data-brand-name="${brand.name}" data-brand-id="${brand._id}">
                                <em class="icon ni ni-edit-alt-fill icon_size"></em>
                            </a>
                            <!-- Delete Button -->
                            <a href="#" class="btn btn-icon btn-trigger me-n1 deleteBtn" data-brand-id="${brand._id}">
    <em class="icon ni ni-trash-empty icon_size"></em>
</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $container.append(brandElement);
    });
}

// AJAX call to fetch brands
$(document).ready(function() {
    $.ajax({
        url: 'http://localhost:3000/attributes/brands',
        type: 'GET',
        dataType: 'json',
        success: function(brands) {
            populateBrands(brands);
        },
        error: function(error) {
            console.error('Error fetching brands:', error);
        }
    });
});
$(document).on('click', '.editBtn', function() {
    console.log("Edit button clicked");
    
    // Fetch brand details from the clicked button
    const brandName = $(this).data('brand-name');
    const brandId = $(this).data('brand-id');
    console.log("Brand Name:", brandName);
    console.log("Brand ID:", brandId);

    // Populate modal input fields
    $('#brandName').val(brandName);
    $('#brandId').val(brandId);

    // Display the modal
    $('#editBrandModal').modal('show');
});

$(document).on('click', '#saveChangesBtn', function() {
    const brandName = $('#brandName').val();
    const brandId = $('#brandId').val();
    
    $.ajax({
        url: `http://localhost:3000/attributes/brands/${brandId}`,
        type: 'PUT',
        dataType: 'json',
        data: { name: brandName },
        success: function(response) {
            console.log('Brand updated:', response);
        
            // Update the UI. For simplicity, let's re-fetch the list of brands.
            fetchBrands();
        
            // Close the modal
            $('#editBrandModal').modal('hide');
        
            // The alert line has been removed
        },
        
        error: function(error) {
            console.error('Error updating brand:', error);
        }
    });
});



function fetchBrands() {
    $.ajax({
        url: 'http://localhost:3000/attributes/brands',
        type: 'GET',
        dataType: 'json',
        success: function(brands) {
            // Clear the existing brands from the UI
            $('.row.g-2').empty();

            // Populate the UI with the fetched brands
            populateBrands(brands);
        },
        error: function(error) {
            console.error('Error fetching brands:', error);
        }
    });
}
$('#addBrandBtn').click(function() {
    const brandName = $('#newBrandName').val();
    if (brandName) {
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/attributes/brands',
            data: { name: brandName },  // Send as form data
            success: function(response) {
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error adding brand:', textStatus, errorThrown);
                console.error('Server response:', jqXHR.responseText);
            }
            
        });
    } else {
        alert('Please enter a brand name');
    }
});





$(document).on('click', '.deleteBtn', function() {
    const brandId = $(this).data('brand-id');
    $.ajax({
        url: `http://localhost:3000/attributes/brands/${brandId}`,
        type: 'DELETE',
        dataType: 'json',
        success: function(response) {
            console.log('Brand deleted:', response);
            // Refresh the brands list in the UI
            fetchBrands();
        },
        error: function(error) {
            console.error('Error deleting brand:', error);
        }
    });
});



