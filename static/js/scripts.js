///////////////////////////////////////////////////////////////
// scripts.js
///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////
// HMTL ELEMENTS
///////////////////////////////////////////////////////////////

const logo 		= document.querySelector('div');
const header 	= document.querySelector('header');
const navLinks 	= document.querySelectorAll('.nav-link');
const sections 	= document.querySelectorAll('main .rounded-3');

const buttonGeneratePalette 	= document.querySelector('#button-generate-palette');
const inputPaletteColors 		= document.querySelector('#input-palette-colors');
const buttonDeletePalettes 		= document.querySelector('#button-delete-palettes');
const paletteContainer 			= document.querySelector('#palette-container');

///////////////////////////////////////////////////////////////

class Palette {
	constructor(numColors, identifier) {
		this.numColors = numColors;
		this.identifier = identifier;
		this.colorsHSL = new Array();
		this.div;
	}
	renderHTML() {
		const div = document.createElement('div');
		div.setAttribute('class', 'palette');
		div.setAttribute('data-palette-number', `palette-${this.identifier}`);
		for (let i = 0; i < this.numColors; i++) {
			const hsl = this.#generateRandomColor();
			this.colorsHSL.push(hsl);
			const css = `hsla(${hsl}, 1.0);`;
			const color = document.createElement('div');
			color.setAttribute('class', 'palette-color');
			color.setAttribute('style', `background-color: ${css}`);
			div.appendChild(color);
			div.addEventListener('click', () => {
				navigator.clipboard.writeText(css);
			});
		}
		this.div = div;
		return div;
	}
	#generateRandomColor() {
		let hue, saturation, lightness = 0;
		hue = Math.random() * 255;
		saturation = Math.random() * 100;
		lightness = Math.random() * 100;
		return `${Math.floor(hue)}, ${Math.floor(saturation)}%, ${Math.floor(lightness)}%`;
	}
	removePalette(element) {
		element.setAttribute('class', 'palette wipe');
		setTimeout(() => {
			element.remove();
		}, 500);
	}
}

///////////////////////////////////////////////////////////////

let PALETTES = new Array();

///////////////////////////////////////////////////////////////

// changes active nav link on click
function loadEvents() {
	navLinks.forEach((l) => {
		l.addEventListener('click', () => {
			const activeLink = document.querySelector('.nav-link.active');
			if (l != activeLink) {
				if (l.className == 'nav-link') {
					l.className = 'nav-link active';
					activeLink.className = 'nav-link';

				} else {
					l.className = 'nav-link';
				}				
			}
		});
	});
	buttonGeneratePalette.addEventListener('click', generatePalette);
	buttonDeletePalettes.addEventListener('click', deletePalettes);
}

// creates a palette and appends it to the generated palettes
function generatePalette() {
	const palette = new Palette(
		inputPaletteColors.value ? inputPaletteColors.value : 8,
		document.querySelectorAll('.palette') ? document.querySelectorAll('.palette').length : 0
	)
	PALETTES.push(palette);
	paletteContainer.appendChild(palette.renderHTML());
}

// removes all generated palettes
// NOTE:: for smoothest animation, need to counter-scroll while deleting... ⚠
function deletePalettes() {
	PALETTES.forEach((p) => {
		console.log('p', p);
		p.removePalette(p.div);
	});
	PALETTES = new Array();
}


// makes header nav sticky when scrolling down
function scrollEvents() {
	const logoHeight = logo.clientHeight;
	if (window.scrollY > logoHeight) {
		header.className = 'd-flex justify-content-center py-2 px-3 mb-3 sticky-header';
	} else {
		header.className = 'd-flex justify-content-center py-2 px-3 mb-3';
	}
	const activeLink = document.querySelector('.nav-link.active');
	let scrollHeights = Array();
	// PRE: links.length == sections.length
	sections.forEach((l) => {
		scrollHeights.push(l.offsetTop);
	});
	let needActiveSection = true;
	while (needActiveSection) {
		for (let i = 0; i < scrollHeights.length; i++) {
			if (window.scrollY <= (scrollHeights.at(i) 
				+ sections.item(i).offsetHeight
				- parseFloat(getComputedStyle(sections.item(i)).marginBottom))) {
				activeLink.className = 'nav-link';
				navLinks.item(i).className = 'nav-link active';
				needActiveSection = false;
				break;
			}
		}
		needActiveSection = false;
	}
}

///////////////////////////////////////////////////////////////
// EVENTS
///////////////////////////////////////////////////////////////

addEventListener('load', loadEvents);
addEventListener('scroll', scrollEvents);

///////////////////////////////////////////////////////////////