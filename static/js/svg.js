///////////////////////////////////////////////////////////////
// svg.js
// svg class for pixel output
///////////////////////////////////////////////////////////////

// PRE: create parent container,
//		create black svg
function canvasToPixelGrid(parentElement, svgElement, imgSrc, scale) {

	return new Promise((resolve, reject) => {
	
		let pixelGrid = []

		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = imgSrc;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d', { willReadFrequently: true });

		img.addEventListener('load', () => {

			canvas.setAttribute('width', img.width);
			canvas.setAttribute('height', img.height);
			parentElement.appendChild(canvas);
			parentElement.appendChild(svgElement);

			ctx.drawImage(img, 0, 0);
			img.setAttribute('style', 'display: none;');

			let scaledHeight = img.height / scale;
			let scaledWidth = img.width / scale;

			for (let r = 0; r < scaledHeight; r++) { // height, y
				let pixelRow = []
				for (let c = 0; c < scaledWidth; c++) { // width, x
					let wSnippet = (((c + 1) * scale) - 1);
					let hSnippet = (((r + 1) * scale) - 1);
					let data = ctx.getImageData(wSnippet, hSnippet, 
											    wSnippet, hSnippet).data;
					let color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
					pixelRow.push(color);
				}
				pixelGrid.push(pixelRow);
				console.log('pushed pixelRow');
			}
			canvas.remove();
			console.log(`pixelGrid.length: ${pixelGrid.length}`);
			resolve(pixelGrid);
		});
		img.addEventListener('error', (error) => {
			reject(error);
		});
	});
}

///////////////////////////////////////////////////////////////
/* PixelGrid:
[
    [
        "rgb(0, 127, 213)",
        "rgb(0, 127, 213)",
        "rgb(0, 127, 213)",
        "rgb(0, 127, 213)",
        "rgb(0, 127, 213)",
        "rgb(0, 127, 213)",
        "rgb(0, 127, 213)",
        "rgb(0, 127, 213)"
    ] ...
]
*/
///////////////////////////////////////////////////////////////

/*
rect.addEventListener('mouseover', () => {
	const coloredRect = rect.cloneNode();
	coloredRect.setAttribute('style', 
		`fill: ${this.colors.at(color).rgb};
		pointer-events: none;`);
	duplicateOnMouseOver(this.svg, coloredRect);
});

function duplicateOnMouseOver(parent, element) {
	const newNode = element.cloneNode();
	newNode.addEventListener('mouseout', ()=> {
		newNode.remove();
	});
	parent.appendChild(newNode);
}
*/

///////////////////////////////////////////////////////////////

class OutputSVG {
	constructor(parentNode, palette, data) {
		this.parentNode = parentNode;
		this.palette = palette;
		this.imgSrc = `${data.outputImg}?${new Date().getTime()}`;

		const wOut = parseInt(data.request['ic-output-w']);
		const hOut = parseInt(data.request['ic-output-h']);
		const scale = parseInt(data.request['ic-mod-upscale']);

		this.colors = data.outPalette.colors;
		this.numColors = data.outPalette.colorsTotal;
		this.numPixels = data.outPalette.pixelsTotal;
		this.scale = scale;
		this.width = wOut * scale;
		this.height = hOut * scale;

		const div = document.createElement('div');
		div.setAttribute('class', 'output-svg-container');
		this.container = div;

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', this.width);
		svg.setAttribute('height', this.height);
		svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
		svg.setAttribute('class', 'output-svg');
		this.svg = svg;
	}
	// async getPixelGrid() {
	// 	this.pixelGrid = await canvasToPixelGrid(this.container, this.svg, this.imgSrc, this.scale);
	// 	console.log('pixelGrid', this.pixelGrid);
	// }
	createSVG() {
		for (let color = 0; color < this.numColors; color++) {
			const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			group.setAttribute('fill', this.colors.at(color).rgb);
			group.setAttribute('data-pixel-group', color);
			for (let r = 0; r < this.pixelGrid.length; r++) {
				// console.log('\tin r');
				for (let c = 0; c < this.pixelGrid.at(r).length; c++) {
					// console.log('\t\tin c');
					if (this.pixelGrid.at(r).at(c) == this.colors.at(color).rgb) {
						const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
						rect.setAttribute('x', c * this.scale);
						rect.setAttribute('y', r * this.scale);
						rect.setAttribute('width', this.scale);
						rect.setAttribute('height', this.scale);
						// rect.setAttribute('style', `fill: ${this.colors.at(color).rgb}`);
						group.appendChild(rect);
					} 
				}
			}
			this.svg.appendChild(group);
		}
	}
	generateBlobUrl(link) {
		const s 	  = new XMLSerializer();
		const str 	  = s.serializeToString(this.svg);
		const blob 	  = new Blob([str], {type: 'image/svg+xml;charset=utf-8'})
		const url 	  = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `pixel-art-${new Date().getTime()}.svg`);
	}
	async renderHTML() {
		this.parentNode.appendChild(this.container);
		try {
			this.pixelGrid = await canvasToPixelGrid(this.container, this.svg, this.imgSrc, this.scale);
		} catch(error) {
			console.error('image load error: ', error);
		}
		console.log('pixelGrid', this.pixelGrid);
		this.createSVG();
		const saveLink = document.querySelector('#ic-output-svg-link');
		if (saveLink) {
			this.generateBlobUrl(saveLink);
		}
	}
}

///////////////////////////////////////////////////////////////