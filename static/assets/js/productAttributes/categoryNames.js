$('#addCategoryBtn').click(function() {
  // Get the values from the modal's input fields
  const categoryType = $('#categoryType').val();
  const newCategoryName = $('#newCategoryName').val();



  // Check if the subcategory already exists in the displayed list
const $existingSubcategories = $(`.row > .col-lg-4:contains(${categoryType})`).find('.h6');
if ($existingSubcategories.filter((_, el) => $(el).text() === newCategoryName).length) {
    alert('This subcategory already exists!');
    return;
}
  // Check if both fields have values
  if (categoryType && newCategoryName) {
      $.ajax({
          type: 'POST',
          url: 'http://localhost:3000/attributes/category',
          data: { 
              Category: categoryType,
              Subcategory: newCategoryName
          },
          success: function(response) {
              console.log('Category added:', response);
              
              // Refresh the list of subcategories for the added category type
              fetchAndPopulateSubcategories(categoryType);

              // Close the modal (if applicable)
              $('[data-bs-dismiss="modal"]').click();
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.error('Error adding category:', textStatus, errorThrown);
              console.error('Server response:', jqXHR.responseText);
          }
      });
  } else {
      alert('Please select a main category and enter a category name.');
  }
});




// Function to fetch and populate subcategories based on main category
function fetchAndPopulateSubcategories(mainCategory) {
  $.ajax({
      url: `http://localhost:3000/attributes/category/${mainCategory}`,
      type: 'GET',
      dataType: 'json',
      success: function(subcategories) {
          // Determine the target container based on the main category
          let $container;
          switch(mainCategory.toLowerCase()) {
              case 'men':
                  $container = $('.row > .col-lg-4').eq(0).find('.card'); // First column for Men
                  break;
              case 'women':
                  $container = $('.row > .col-lg-4').eq(1).find('.card'); // Second column for Women
                  break;
              case 'unisex':
                  $container = $('.row > .col-lg-4').eq(2).find('.card'); // Third column for Unisex
                  break;
          }

          // Clear any previous subcategories
          $container.find('.card-inner-md').remove();
          
          // Append each subcategory to the container
          subcategories.forEach(subcategory => {
              const subcategoryElement = `
                  <div class="card-inner card-inner-md">
                      <div class="user-card">
                          <div class="user-info">
                              <span class="h6">${subcategory.Subcategory}</span>
                          </div>
                          
                          <div class="user-action">
                          <!-- Add this button within your category card element -->
<a href="#" class="btn btn-icon btn-trigger me-n1 editCategoryBtn"  data-category-Id="${subcategory._id}" data-category-name="${subcategory.Subcategory}">
    <em class="icon ni ni-edit"></em>
</a>

                              <a href="#" class="btn btn-icon delCat btn-trigger me-n1" data-category-id="${subcategory._id}">
                                  <em class="icon ni ni-trash-empty icon_size"></em>
                              </a>
                          </div>
                      </div>
                  </div>
              `;

              $container.append(subcategoryElement);
          });
      },
      error: function(error) {
          console.error(`Error fetching subcategories for ${mainCategory}:`, error);
      }
  });
} 





$(document).on('click', '.delCat', function (event) {
    console.log("Delete button clicked");
    event.preventDefault();

    const subcategoryName = $(this).data('category-id');
    console.log("Subcategory:", subcategoryName);

    // Use SweetAlert2 for confirmation
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Proceed with deletion
            $.ajax({
                type: 'DELETE',
                url: `http://localhost:3000/attributes/category/${encodeURIComponent(subcategoryName)}`,
                success: function (response) {
                    console.log('Subcategory deleted:', response);

                    // Remove the subcategory element from the DOM
                    $(event.target).closest('.card-inner-md').remove();

                    // Show success message
                    Swal.fire(
                        'Deleted!',
                        'Subcategory has been deleted.',
                        'success'
                    );
                },
                error: function (xhr, status, error) {
                    if (xhr.status === 400) {
                        // Server responded with a 400 status, indicating the subcategory is in use
                        Swal.fire(
                            'Error!',
                            xhr.responseJSON.message,
                            'error'
                        );
                    } else {
                        // Handle other kinds of errors
                        console.error('An error occurred:', error);
                        Swal.fire(
                            'Error!',
                            'An error occurred while deleting the subcategory.',
                            'error'
                        );
                    }
                }
            });
        }
    });
});



// Call the function for each main category on document ready
$(document).ready(function() {
  ['Men', 'Women', 'Unisex'].forEach(mainCategory => {
      fetchAndPopulateSubcategories(mainCategory);
  });
});



// Handle the click event for the Edit Category button
$(document).on('click', '.editCategoryBtn', function(e) {
    e.preventDefault();

    const categoryId = $(this).data('category-id');
    const categoryName = $(this).data('category-name');
    console.log(`Edit Category data ${categoryId} ${categoryName}`);

    // Populate the edit category modal with the current category name
    $('#editCategoryName').val(categoryName);

    // Store the category ID for the update button
    $('#updateCategoryBtn').data('category-id', categoryId);

    // Show the edit category modal
    $('#editCategoryModal').modal('show');
});

// Handle the click event for the Update Category button
$('#updateCategoryBtn').click(function() {
    const categoryId = $(this).data('category-id');
    const updatedCategoryName = $('#editCategoryName').val();
    console.log(`From Update category button ${categoryId} ${updatedCategoryName}`);

    // AJAX request to update the category name
    $.ajax({
        url: `http://localhost:3000/attributes/category/${categoryId}/${updatedCategoryName}`,
        type: 'PUT',
        data: {
            name: updatedCategoryName
        },
        success: function(updatedCategory) {
            console.log('Category updated:', updatedCategory);
            $('#editCategoryModal').modal('hide'); // Hide the modal

            // Update the category name in the UI without reloading
            const categoryCard = $(`.user-action .editCategoryBtn[data-category-id="${categoryId}"]`)
                .closest('.user-card');
            categoryCard.find('.h6').text(updatedCategoryName);
        },
        error: function(xhr, status, error) {
            if (xhr.status === 400) {
                // Server responded with a 400 status, indicating a problem
                alert(xhr.responseJSON.message);
            } else {
                // Handle other kinds of errors
                console.error('An error occurred:', error);
            }
        }
    });
});

