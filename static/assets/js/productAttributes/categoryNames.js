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
                              <a href="#" class="btn btn-icon btn-trigger me-n1">
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





$(document).on('click', '.btn-trigger', function(event) {
  console.log("Delete button clicked");
  event.preventDefault();

  const subcategoryName = $(this).closest('.user-card').find('.h6').text();
  const mainCategory = $(this).closest('.col-lg-4').find('.title').text();
  console.log("Main Category:", mainCategory);
  console.log("Subcategory:", subcategoryName);

  $.ajax({
      type: 'DELETE',
      url: `http://localhost:3000/attributes/category/${encodeURIComponent(mainCategory)}/${encodeURIComponent(subcategoryName)}`,
      success: function(response) {
          console.log('Subcategory deleted:', response);

          // Remove the subcategory element from the DOM
          $(event.target).closest('.card-inner-md').remove();
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error deleting subcategory:', textStatus, errorThrown);
          console.error('Server response:', jqXHR.responseText);
      }
  });
});


// Call the function for each main category on document ready
$(document).ready(function() {
  ['Men', 'Women', 'Unisex'].forEach(mainCategory => {
      fetchAndPopulateSubcategories(mainCategory);
  });
});
