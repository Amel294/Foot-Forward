// const imageInput = document.getElementById('imageInput');
// const previewArea = document.getElementById('imagePreviewArea');
// const cropButton = document.getElementById('cropButton');
// const uploadForm = document.getElementById('uploadForm');
// let croppers = [];

// imageInput.addEventListener('change', function() {
//     const files = this.files;

//     previewArea.innerHTML = ''; // Clear previous previews
//     croppers = []; // Clear previous cropper instances

//     Array.from(files).forEach((file, index) => {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const img = document.createElement('img');
//             img.src = e.target.result;
//             img.style.maxWidth = '200px'; // or any other style adjustments you want
//             previewArea.appendChild(img);
            
//             const cropper = new Cropper(img, {
//                 aspectRatio: 1
//             });
//             croppers.push(cropper);
//         }
//         reader.readAsDataURL(file);
//     });

//     cropButton.style.display = 'block';
// });

// cropButton.addEventListener('click', function() {
//     croppers.forEach((cropper, index) => {
//         const croppedCanvas = cropper.getCroppedCanvas();
//         const input = document.createElement('input');
//         input.type = 'hidden';
//         input.name = `croppedImage${index}`;
//         input.value = croppedCanvas.toDataURL('image/jpeg');
//         uploadForm.insertBefore(input, uploadForm.firstChild);
//     });

//     uploadForm.style.display = 'block';
// });
