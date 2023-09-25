///////////////////////////////////////////////////////////////
// mvp.js
///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////
// HMTL ELEMENTS
///////////////////////////////////////////////////////////////

const logo 		= document.querySelector('div');
const header 	= document.querySelector('header');

const imageConversionForm   = document.querySelector('#ic-form');
const inputImage			= document.querySelector('#converter-image-input');
const inputSampleDropdown 	= document.querySelector('#ic-input-sample');
const inputImageFile		= document.querySelector('#ic-input-upload');

const table 				= document.querySelector('#ic-mod-table');
const tds 					= table.querySelectorAll('td');
const imageOutputW 			= document.querySelector('#ic-output-w');
const imageOutputH 			= document.querySelector('#ic-output-h');
const upscaleLabelSpan		= document.querySelector('#ic-mod-upscale-label span');
const upscaleSlider 		= document.querySelector('#ic-mod-upscale');
const colorsLabelSpan		= document.querySelector('#ic-mod-colors-label span');
const colorsSlider 			= document.querySelector('#ic-mod-colors');
const convert 				= document.querySelector('#ic-mod-convert');

const outputImage			= document.querySelector('#converter-image-output');
const status 				= document.querySelector('#ic-output-status'); 
const saveButton 			= document.querySelector('#ic-output-save');
const saveImgLink 			= document.querySelector('#ic-output-link');

///////////////////////////////////////////////////////////////

// changes active nav link on click
function loadEvents() {
	// update sample images
	inputSampleDropdown.addEventListener('change', () => {
		let selected = inputSampleDropdown.selectedOptions;
		loadImageSrc(selected[0].dataset.imgSrc);
		outputImage.src = '';
		saveButton.setAttribute('disabled', '');
	});
	// update user image
	inputImageFile.addEventListener('change', (e) => {
		uploadImage(e);
	}); 
	// update upscale
	upscaleSlider.addEventListener('input', () => {
		upscaleLabelSpan.textContent = `(x${upscaleSlider.value})`;
		tds[4].textContent = `${parseInt(tds[2].textContent) * upscaleSlider.value}px`;
		tds[5].textContent = `${parseInt(tds[3].textContent) * upscaleSlider.value}px`;
	});
	// update colors
	colorsSlider.addEventListener('input', () => {
		colorsLabelSpan.textContent = `(${colorsSlider.value})`;
	});

	imageConversionForm.addEventListener('submit', (e) => {
		submitConversionForm(e);
	});
}

// validate and preview image upload
function uploadImage(e) {
	const inputImg = e.target;
	const file = inputImg.files[0];
	const maxSize = 1024 * 1024; // 1 MB

	if (file && file.size > maxSize) {
	    alert('Please select an image less than 1 MB in size.');
	    inputImg.value = '';
	}
	else {
		inputSampleDropdown.querySelector('option').selected = true;
		saveImgLink.href = '';
		const reader = new FileReader();
		reader.onload = (e) => {
		    inputImage.src = e.target.result;
			inputImage.complete
				? addTableData()
				: inputImage.onload = addTableData
		};
		reader.readAsDataURL(file);
		upscaleSlider.removeAttribute('disabled');
		colorsSlider.removeAttribute('disabled');
		convert.removeAttribute('disabled');
		status.textContent = 'Modify then press \'Convert Image\'';
	}
}

// loads the input image preview
function loadImageSrc(src) {
	inputImage.src = src;
	inputImage.complete
		? addTableData()
		: inputImage.onload = addTableData
	inputImageFile.value = '';
	saveImgLink.href = '';
	upscaleSlider.removeAttribute('disabled');
	colorsSlider.removeAttribute('disabled');
	convert.removeAttribute('disabled');
	status.textContent = 'Modify then press \'Convert Image\'';
}

// populates the modify table when selecting an input image
function addTableData() {
	// input
	tds[0].textContent = `${inputImage.naturalWidth}px`;
	tds[1].textContent = `${inputImage.naturalHeight}px`;
	// output	
	tds[2].textContent = `${Math.floor(inputImage.naturalWidth / 10)}px`;
	tds[3].textContent = `${Math.floor(inputImage.naturalHeight / 10)}px`;
	imageOutputW.value = Math.floor(inputImage.naturalWidth / 10);
	imageOutputH.value = Math.floor(inputImage.naturalHeight / 10);
	// upscale
	tds[4].textContent = `${parseInt(tds[2].textContent) * upscaleSlider.value}px`;
	tds[5].textContent = `${parseInt(tds[3].textContent) * upscaleSlider.value}px`;
}

function imageOutputError() {
   	outputImage.src = outputImage.dataset.errorSrc;
	status.textContent = 'Error converting image!';
   	resetWhenLoaded(false);
}

// handle form data submission
function submitConversionForm(e) {
	e.preventDefault();
	const formData = new FormData(e.target);

	fetch('/convert', {
	    method: 'POST',
	    body: formData
	})
	.then(response => response.json())
	.then(data => {
	    console.log(data);
	    if (data.outputImg) {
	    	outputImage.src = data.outputImg;
	    	saveImgLink.href = data.outputImg;
			status.textContent = 'Image converted successfully!';
	    	resetWhenLoaded(true);
	    }
	    else {
			imageOutputError();
	    }
	})
	.catch(error => {
	    console.error('Error:', error);
		imageOutputError();
	});
	disableWhileLoading();
	return false;
}

// disables inputs while processing an image
function disableWhileLoading() {
	inputSampleDropdown.disabled 	= true;
	inputImageFile.disabled 		= true;
	upscaleSlider.disabled 			= true;
	colorsSlider.disabled 			= true;
	convert.disabled 				= true;
	outputImage.src = outputImage.dataset.loadingSrc;
	inputImageFile.value
		? status.textContent = `Converting '${inputImageFile.value}'...`
		: status.textContent = `Converting '${inputSampleDropdown.selectedOptions[0].textContent}'...`
}

// resets disabled inputs after an output image is loaded
function resetWhenLoaded(successful) {
	inputSampleDropdown.disabled 	= false;
	inputImageFile.disabled 		= false;
	upscaleSlider.disabled 			= false;
	colorsSlider.disabled 			= false;
	convert.disabled 				= false;
	if (successful) {
		saveButton.removeAttribute('disabled');
	}
}


///////////////////////////////////////////////////////////////
// EVENTS
///////////////////////////////////////////////////////////////

addEventListener('load', loadEvents);

///////////////////////////////////////////////////////////////