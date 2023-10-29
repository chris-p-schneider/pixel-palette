///////////////////////////////////////////////////////////////
// mvp.js
///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////
// HMTL ELEMENTS
///////////////////////////////////////////////////////////////

const logo 		  			= document.querySelector('div');
const header 	  			= document.querySelector('header');
const themeToggle 			= document.querySelector('#theme-toggle');
const themeStyles 			= document.querySelector('#theme-style');

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

const generateSvgCheckbox   = document.querySelector('#ic-mod-svg');
const estimatedTime 		= document.querySelector('#estimated-time');
let countdownId;			// used to initialize interval
const convert 				= document.querySelector('#ic-mod-convert');
const cancelConversion		= document.querySelector('#ic-cancel-convert');

const outputContainer		= document.querySelector('#output-image-container');
const outputImage			= document.querySelector('#converter-image-output');
const status 				= document.querySelector('#ic-output-status');

const savePngButton 		= document.querySelector('#ic-output-png-save');
const savePngLink 			= document.querySelector('#ic-output-png-link');
const saveSvgLink 			= document.querySelector('#ic-output-svg-link');
const saveSvgButton 		= document.querySelector('#ic-output-svg-save');

const paletteInput 			= document.querySelector('#palette-input');
const paletteOutput 		= document.querySelector('#palette-output');

///////////////////////////////////////////////////////////////
// toggles light/dark theme
///////////////////////////////////////////////////////////////

function toggleTheme() {
	if (themeToggle.textContent == '🌞') {
		themeToggle.textContent = '🌒';
		themeStyles.innerHTML = 
			`:root {
				color: hsla(0, 0%, 95%, 1);
				background-color: hsla(0, 0%, 5%, 1.0);
			}
			td, input, select, button {
				background-color: hsla(0, 0%, 10%, 1.0) !important;
				color: hsla(0, 0%, 95%, 1);
			}
			h2 {
				color: hsla(0, 0%, 90%, 1.0) !important;
			}
			#estimated-time-p {
				background-color: hsla(0, 0%, 0%, 1.0);
				color: white;
			}`;
	}
	else {
		themeToggle.textContent = '🌞';
		themeStyles.innerHTML = 
			`:root {
				color: hsla(0, 0%, 0%, 1);
				background-color: hsla(0, 0%, 99%, 1.0);
			}`;
	}
}

// temporarily adds animation to image on load
function addRemoveImgLoadAnimation(img) {
	const originalClass = img.className;
	const fadeIn = `${originalClass} fade-in`;
	const fadeOut = `${originalClass} fade-out`;
	img.setAttribute('class', fadeIn);
	setTimeout(() => {
		img.setAttribute('class', originalClass);
	}, 340);
}

///////////////////////////////////////////////////////////////
// initialize page elements and events
///////////////////////////////////////////////////////////////

function loadEvents() {
	// add theme toggle
	themeToggle.addEventListener('click', toggleTheme);
	// themeToggle.click();
	// update sample images
	inputSampleDropdown.addEventListener('change', (e) => {
		let selected = inputSampleDropdown.selectedOptions;
		inputImageFile.value = '';
		loadImageSrc(selected[0].dataset.imgSrc);
		requestInputPalette(e);
		outputImage.src = '';
		// outputContainer.innerHTML = '';
		const svgOutput = document.querySelector('.output-svg-container');
		if (svgOutput) {
			svgOutput.remove();
		}
		savePngButton.disabled = true;
		saveSvgButton.disabled = true;
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
		loadingTimeEstimate(colorsSlider.value, imageOutputW.value * adjustedHeight);
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
		loadingTimeEstimate(colorsSlider.value, imageOutputW.value * adjustedHeight);
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
		loadingTimeEstimate(colorsSlider.value, 
			parseInt(tds[3].textContent) * parseInt(tds[4].textContent));
	});
	// update submit button
	imageConversionForm.addEventListener('submit', (e) => {
		submitConversionForm(e);
	});
	// update cancel button
	cancelConversion.addEventListener('click', (e) => {
		fetch('/stop-conversion', {
		    method: 'POST'
		})
		.then(response => {
			console.log(response);
		})
		.catch(error => {
		    console.error('Error:', error);
		});

	});
	// create initial palette placeholders
	paletteInput.appendChild(new PaletteLoader(16, false).generateForm());
	paletteOutput.appendChild(new PaletteLoader(1, false).generateForm());
}

// remove disabled attributes from modify column
function removeDisabled() {
	imageOutputW.removeAttribute('disabled');
	imageOutputH.removeAttribute('disabled');
	upscaleSlider.removeAttribute('disabled');
	colorsSlider.removeAttribute('disabled');
	generateSvgCheckbox.removeAttribute('disabled');
	convert.removeAttribute('disabled');
}

// validate and preview image upload
function uploadImage(e) {
	const inputImg = e.target;
	const file 	   = inputImg.files[0];
	const maxSize  = 1024 * 1024; // 1 MB

	if (file && file.size > maxSize) {
	    alert('Please select an image less than 1 MB in size.');
	    inputImg.value = '';
	}
	else {
		inputSampleDropdown.querySelector('option').selected = true;
		savePngLink.href = '';
		saveSvgLink.href = '';
		const reader = new FileReader();
		reader.onload = (e) => {
		    inputImage.src = e.target.result;
			addRemoveImgLoadAnimation(inputImage);
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
	preloadImage = new Image();
	preloadImage.src = src;
	preloadImage.addEventListener('load', () => {
		inputImage.src = src;
		addRemoveImgLoadAnimation(inputImage);
		inputImage.complete
			? addTableData()
			: inputImage.onload = addTableData
		status.textContent = 'Modify then press \'Convert Image\'';
		inputImageFile.value = '';
		savePngLink.href = '';
		saveSvgLink.href = '';
		removeDisabled();
	});
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
	loadingTimeEstimate(colorsSlider.value, 
		parseInt(tds[3].textContent) * parseInt(tds[4].textContent));
	imageOutputW.value = Math.floor(inputImage.naturalWidth / 10);
	imageOutputH.value = Math.floor(inputImage.naturalHeight / 10);
	// upscale
	tds[6].textContent = `${parseInt(tds[3].textContent) * upscaleSlider.value}px`;
	tds[7].textContent = `${parseInt(tds[4].textContent) * upscaleSlider.value}px`;
	tds[8].textContent = `${parseInt(tds[6].textContent) * parseInt(tds[7].textContent)}px`;
}

function imageOutputError() {
   	outputImage.src    = outputImage.dataset.errorSrc;
	status.textContent = 'Error converting image!';
   	resetWhenLoaded(false);
}

// send input image to get palette
function requestInputPalette(e) {
	paletteInput.innerHTML = '';
	paletteOutput.innerHTML = '';
	paletteInput.appendChild(new PaletteLoader(16, true).generateForm());
	paletteOutput.appendChild(new PaletteLoader(colorsSlider.value, false).generateForm());
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
	if (parseInt(tds[5].textContent) >= 10000 && generateSvgCheckbox.checked) {
		if (!confirm('This size SVG might crash your browser. Proceed?')) {
			generateSvgCheckbox.checked = false;
			return;
		}
	}
	loadingTimeEstimate(colorsSlider.value, 
		parseInt(tds[3].textContent) * parseInt(tds[4].textContent), true);
	cancelConversion.disabled = false;
	const formData = new FormData(e.target);
	// outputContainer.innerHTML = '';
	const svgOutput = document.querySelector('.output-svg-container');
	if (svgOutput) {
		svgOutput.remove();
	}
	paletteOutput.innerHTML = '';
	paletteOutput.appendChild(new PaletteLoader(colorsSlider.value, true).generateForm());

	fetch('/convert', {
	    method: 'POST',
	    body: formData
	})
	.then(response => response.json())
	.then(data => {
	    console.log('conversion data', data);
	    clearInterval(countdownId);
	    if (data.outputImg) {
	    	outputImage.src = `${data.outputImg}?${new Date().getTime()}`;
	    	savePngLink.href = data.outputImg;
			status.textContent = `Image converted successfully in ${data.time}!`;
	    	resetWhenLoaded(true);
	    	if (data.time) {
	    		compareConversionAndEstimate(data.time);
	    	} else {
	    		estimatedTime.textContent = '00:00:00';
	    		estimatedTime.removeAttribute('data-estimate');
	    	}
   	    	if (data.outPalette) {
	   	    	const palette = new Palette(JSON.stringify(data.outPalette));
		    	paletteOutput.innerHTML = '';
		    	paletteOutput.appendChild(palette.generateForm());   	    		
	   	    	if (generateSvgCheckbox.checked) {
	   				const svg = new OutputSVG(outputContainer, palette, data);
	   				svg.renderHTML();
	   	    	}
   	    	}
   	    	if (data.cancelled) {
				outputImage.src = '';
		    	paletteOutput.innerHTML = '';
				paletteOutput.appendChild(new PaletteLoader(colorsSlider.value, false).generateForm());
				loadingTimeEstimate(colorsSlider.value, 
					parseInt(tds[3].textContent) * parseInt(tds[4].textContent));
				status.textContent = `Conversion cancelled!`;
				savePngButton.disabled = true;
				saveSvgButton.disabled = true;
   	    	}
	    }
	    else {
			imageOutputError();
	    }
	})
	.catch(error => {
	    console.error('Error:', error);
		imageOutputError();
		paletteOutput.innerHTML = '';
		paletteOutput.appendChild(new PaletteLoader(
			colorsSlider.value, false).generateForm());
	});
	disableWhileLoading();
	return false;
}

// disables inputs while processing an image
function disableWhileLoading() {
	inputSampleDropdown.disabled = true;
	inputImageFile.disabled 	 = true;
	imageOutputW.disabled		 = true;
	imageOutputH.disabled 		 = true;
	upscaleSlider.disabled 		 = true;
	colorsSlider.disabled 		 = true;
	generateSvgCheckbox.disabled = true;
	convert.disabled 			 = true;
	outputImage.src = outputImage.dataset.loadingSrc;
	inputImageFile.value
		? status.textContent = `Converting '${inputImageFile.value}'...`
		: status.textContent = `Converting '${inputSampleDropdown.selectedOptions[0].textContent}'...`
}

// resets disabled inputs after an output image is loaded
function resetWhenLoaded(successful) {
	inputSampleDropdown.disabled = false;
	inputImageFile.disabled 	 = false;
	imageOutputW.disabled		 = false;
	imageOutputH.disabled 		 = false;
	upscaleSlider.disabled 		 = false;
	colorsSlider.disabled 		 = false;
	generateSvgCheckbox.disabled = false;
	convert.disabled 			 = false;
	cancelConversion.disabled    = true;
	if (successful) {
		savePngButton.removeAttribute('disabled');
		if (generateSvgCheckbox.checked) {
			saveSvgButton.removeAttribute('disabled');
		} else {
			saveSvgButton.disabled = true;
		}
	}
}

// show an estimated time when adjusting output size
// IN: num colors, pixel area
function loadingTimeEstimate(colors, pixels, countdownBool=false) {
	let s = 0;
	colors <= 4
		? s = (0.001978814 * pixels) - 0.217346
		: colors <= 8
			? s = (0.003727724 * pixels) + 3.425029
			: colors <= 12
				? s = (0.007271631 * pixels) + 3.324693
				: colors <= 16
					? s = (0.0109569 * pixels) + 2.244694
					: colors <= 20
						? s = (0.02000925 * pixels) - 7.058332
						: colors <= 24
							? s = (0.02809849 * pixels) - 13.62986
							: s = 0
    if (s == 0) {
    	let c24 = (0.02936306 * pixels) - 25.69328;
    	let s = c24 * (colors / 24);
    } else if (s < 0) {
       	s = 2;
    }
    s < 1 ? s = Math.ceil(s) : s = Math.floor(s)
    estimatedTime.setAttribute('data-estimate', s);

	let date = new Date(0);
	date.setSeconds(s);
	estimatedTime.textContent = date.toISOString().substring(11, 19);
	if (countdownBool) {
		countdownId = setInterval(() => {
			if (s == 0) {
				estimatedTime.textContent = 'Welp, probably soon.';
				clearInterval(countdownId);
			} else {
				s--;
				date = new Date(0);
				date.setSeconds(s);
				estimatedTime.textContent = date.toISOString().substring(11, 19);
			}
		}, 1000);
	}
}

function compareConversionAndEstimate(dataTime) {
	const dt = dataTime.split(':'); 				      // MM:SS:mm
	const secEst = parseInt(estimatedTime.dataset.estimate); // SS
    estimatedTime.removeAttribute('data-estimate');
	let secData = 0;
	if (dt.length == 2) {
		secData = parseInt(dt[0]) + parseInt(dt[1]) * 0.01;
	}
	else {
		secData = parseInt(dt[0]) * 60 + parseInt(dt[1]) + parseInt(dt[2]) * 0.01;
	}
	estimatedTime.textContent = `Accuracy within ${Math.abs((secEst - secData).toFixed(2))}s`;
}


///////////////////////////////////////////////////////////////
// EVENTS
///////////////////////////////////////////////////////////////

addEventListener('load', loadEvents);

///////////////////////////////////////////////////////////////