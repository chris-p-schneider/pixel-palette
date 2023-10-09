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

const paletteInput 	= document.querySelector('#palette-input');
const paletteOutput = document.querySelector('#palette-output');

///////////////////////////////////////////////////////////////

// changes active nav link on click
function loadEvents() {
	// update sample images
	inputSampleDropdown.addEventListener('change', (e) => {
		let selected = inputSampleDropdown.selectedOptions;
		loadImageSrc(selected[0].dataset.imgSrc);
		requestInputPalette(e);
		outputImage.src = '';
		saveButton.setAttribute('disabled', '');
	});
	// update user image
	inputImageFile.addEventListener('change', (e) => {
		uploadImage(e);
	});
	// output width
	imageOutputW.addEventListener('input', () => {
		tds[3].textContent = `${parseInt(imageOutputW.value)}px`;
		let adjustedHeight = Math.floor(inputImage.naturalHeight / (inputImage.naturalWidth / imageOutputW.value));
		imageOutputH.value = adjustedHeight;
		tds[4].textContent = `${parseInt(adjustedHeight)}px`;
		tds[5].textContent = `${imageOutputW.value * adjustedHeight}px`;
		tds[6].textContent = `${imageOutputW.value * upscaleSlider.value}px`;
		tds[7].textContent = `${adjustedHeight * upscaleSlider.value}px`;
		tds[8].textContent = `${imageOutputW.value * upscaleSlider.value 
								* adjustedHeight * upscaleSlider.value}px`;
	});
	// output height
	imageOutputH.addEventListener('input', () => {
		tds[4].textContent = `${parseInt(imageOutputH.value)}px`;
		let adjustedWidth = Math.floor(inputImage.naturalWidth / (inputImage.naturalHeight / imageOutputH.value));
		imageOutputW.value = adjustedWidth;
		tds[3].textContent = `${parseInt(adjustedWidth)}px`;
		tds[5].textContent = `${imageOutputH.value * adjustedWidth}px`;
		tds[6].textContent = `${adjustedWidth * upscaleSlider.value}px`;
		tds[7].textContent = `${imageOutputH.value * upscaleSlider.value}px`;
		tds[8].textContent = `${adjustedWidth * upscaleSlider.value 
								* imageOutputH.value * upscaleSlider.value}px`;
	});
	// update upscale
	upscaleSlider.addEventListener('input', () => {
		upscaleLabelSpan.textContent = `(x${upscaleSlider.value})`;
		tds[6].textContent = `${imageOutputW.value * upscaleSlider.value}px`;
		tds[7].textContent = `${imageOutputH.value * upscaleSlider.value}px`;
		tds[8].textContent = `${imageOutputW.value * upscaleSlider.value 
								* imageOutputH.value * upscaleSlider.value}px`;
	});
	// update colors
	colorsSlider.addEventListener('input', () => {
		colorsLabelSpan.textContent = `(${colorsSlider.value})`;
		paletteOutput.innerHTML = '';
		paletteOutput.appendChild(new PaletteLoader(colorsSlider.value, false).generateForm());
	});
	// update submit button
	imageConversionForm.addEventListener('submit', (e) => {
		submitConversionForm(e);
	});
	// create initial palette placeholders
	paletteInput.appendChild(new PaletteLoader(16, false).generateForm())
	paletteOutput.appendChild(new PaletteLoader(1, false).generateForm())
}

// remove disabled attributes from modify column
function removeDisabled() {
	imageOutputW.removeAttribute('disabled');
	imageOutputH.removeAttribute('disabled');
	upscaleSlider.removeAttribute('disabled');
	colorsSlider.removeAttribute('disabled');
	convert.removeAttribute('disabled');
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
		requestInputPalette(e);
		reader.readAsDataURL(file);
		removeDisabled();
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
	removeDisabled();
	status.textContent = 'Modify then press \'Convert Image\'';
}

/* populates the modify table when selecting an input image
				width 	height 	upscaled
	input 		[0]		[1] 	[2] 
	output 		[3]		[4]		[5]
	upscaled	[6]		[7]		[8]
*/
function addTableData() {
	// input
	tds[0].textContent = `${inputImage.naturalWidth}px`;
	tds[1].textContent = `${inputImage.naturalHeight}px`;
	tds[2].textContent = `${inputImage.naturalWidth * inputImage.naturalHeight}px`;
	// output	
	tds[3].textContent = `${Math.floor(inputImage.naturalWidth / 10)}px`;
	tds[4].textContent = `${Math.floor(inputImage.naturalHeight / 10)}px`;
	tds[5].textContent = `${parseInt(tds[3].textContent) * parseInt(tds[4].textContent)}px`;
	imageOutputW.value = Math.floor(inputImage.naturalWidth / 10);
	imageOutputH.value = Math.floor(inputImage.naturalHeight / 10);
	// upscale
	tds[6].textContent = `${parseInt(tds[3].textContent) * upscaleSlider.value}px`;
	tds[7].textContent = `${parseInt(tds[4].textContent) * upscaleSlider.value}px`;
	tds[8].textContent = `${parseInt(tds[6].textContent) * parseInt(tds[7].textContent)}px`;
}

function imageOutputError() {
   	outputImage.src = outputImage.dataset.errorSrc;
	status.textContent = 'Error converting image!';
   	resetWhenLoaded(false);
}

// send input image to get palette
function requestInputPalette(e) {
	paletteInput.innerHTML = '';
	paletteInput.appendChild(new PaletteLoader(16, true).generateForm())
	paletteOutput.innerHTML = '';
	paletteOutput.appendChild(new PaletteLoader(colorsSlider.value, false).generateForm())
	const formData = new FormData(imageConversionForm);
	fetch('/input_palette', {
	    method: 'POST',
	    body: formData
	})
	.then(response => response.json())
	.then(data => {
	    // console.log(data);
	    if (data.isInput) {
			paletteInput.innerHTML = '';
			paletteInput.appendChild(new Palette(JSON.stringify(data)).generateForm());
	    }
	})
	.catch(error => {
	    console.error('Error:', error);
	});
}

// handle form data submission
function submitConversionForm(e) {
	e.preventDefault();
	const formData = new FormData(e.target);
	paletteOutput.innerHTML = '';
	paletteOutput.appendChild(new PaletteLoader(colorsSlider.value, true).generateForm())

	fetch('/convert', {
	    method: 'POST',
	    body: formData
	})
	.then(response => response.json())
	.then(data => {
	    console.log(data);
	    if (data.outputImg) {
	    	outputImage.src = `${data.outputImg}?${new Date().getTime()}`;
	    	saveImgLink.href = data.outputImg;
			status.textContent = `Image converted successfully in ${data.time}!`;
	    	resetWhenLoaded(true);
	    	paletteOutput.innerHTML = '';
	    	paletteOutput.appendChild(new Palette(JSON.stringify(data.outPalette)).generateForm());
	    }
	    else {
			imageOutputError();
	    }
	})
	.catch(error => {
	    console.error('Error:', error);
		imageOutputError();
		paletteOutput.innerHTML = '';
		paletteOutput.appendChild(new PaletteLoader(colorsSlider.value, false).generateForm())
	});
	disableWhileLoading();
	return false;
}

// disables inputs while processing an image
function disableWhileLoading() {
	inputSampleDropdown.disabled 	= true;
	inputImageFile.disabled 		= true;
	imageOutputW.disabled			= true;
	imageOutputH.disabled 			= true;
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
	imageOutputW.disabled			= false;
	imageOutputH.disabled 			= false;
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