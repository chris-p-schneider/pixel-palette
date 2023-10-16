///////////////////////////////////////////////////////////////
// palette.js
// palette class template
///////////////////////////////////////////////////////////////

class Color {
	constructor(color, pixels, colorIndex, totalColors, isInput) {
		this.colorCurrent = chroma(color);
		this.colorInitial = chroma(color);
		this.pixels = pixels;
		this.colorIndex = colorIndex;
		totalColors <= 12
			? totalColors < 4
				? this.sizeClass = 'sw_1'
				: this.sizeClass = 'sw_4'
			: this.sizeClass = 'sw_8'
		this.isInput = isInput;
	}
	generateInput() {
		const input = document.createElement('input');
		input.setAttribute('type', 'color');
		input.setAttribute('id', `color-index-${this.colorIndex}`);
		input.setAttribute('class', `swatch ${this.sizeClass}`);
		if (this.isInput) {
			input.setAttribute('disabled', true);
		}
		input.setAttribute('value', this.colorCurrent.hex());
		input.addEventListener('input', () => {
			this.colorCurrent = input.value;
			const group = document.querySelector(`g[data-pixel-group="${this.colorIndex}"]`);
			if (group) {
				group.setAttribute('fill', this.colorCurrent);
			}
		});
		return input;
	}
	copyColor() {
		navigator.clipboard.writeText(this.colorCurrent);
		console.log(`copied color: ${this.colorCurrent}`);
	}
	resetColor() {
		this.colorCurrent = this.colorInitial;
		const group = document.querySelector(`g[data-pixel-group="${this.colorIndex}"]`);
		if (group) {
			group.setAttribute('fill', this.colorInitial);
		}

	}
}

///////////////////////////////////////////////////////////////
/* JSON:
{
    "outPalette": {
        "colors": [
            {
                "pixels": 35,
                "rgb": "rgb(0, 127, 213)"
            } ...
        ],
        "colorsTotal": 8,
        "isInput": false,
        "pixelsTotal": 64
    },
    "outputImg": "/static/img/output/cat.png",
    "request": {
        "ic-input-sample": "cat.png",
        "ic-mod-colors": "8",
        "ic-mod-upscale": "20",
        "ic-output-h": "8",
        "ic-output-w": "8"
    },
    "time": "00:40"
}
*/
///////////////////////////////////////////////////////////////

class Palette {
	constructor(json) {
		this.json = json;
		this.data = JSON.parse(json);
		// console.log('Palette ctor:', this.data);
		this.isInput = this.data.isInput;
		this.colorsInitial = new Array();
		for (const c in this.data.colors) {
			this.colorsInitial.push(
				new Color(this.data.colors.at(c).rgb, 
						  this.data.colors.at(c).pixels, c,
						  this.data.colorsTotal,
						  this.data.isInput));
		}
		this.colorsCurrent = this.colorsInitial;
		this.form = document.createElement('form');
	}
	generateForm() {
		this.form.setAttribute('class', 'palette-form');
		this.form.setAttribute('method', 'post');
		this.colorsCurrent.forEach((c) => {
			this.form.appendChild(c.generateInput());
		});
		if (!this.isInput) {
			const reset = document.createElement('button');
			reset.textContent = 'Reset Palette';
			reset.addEventListener('click', (e) => {
				e.preventDefault();
				console.log('resetPalette', this);
				this.resetPalette();
				return false;
			});
			this.form.appendChild(reset);			
		}
		return this.form;
	}
	showColorPicker(color) {
		//
	}
	resetPalette() {
		const inputs = this.form.querySelectorAll('.swatch');
		inputs.forEach((i, c) => {
			i.value = this.colorsInitial.at(c).colorInitial.hex();
		});
		this.colorsCurrent.forEach((c) => {
			c.resetColor();
		});
	}
	submitForm() {
		//	
	}
	exportPalette() {
		//
	}
	importPalette() {
		//		
	}
}

///////////////////////////////////////////////////////////////

class PaletteLoader {
	constructor(colorsTotal, isAnimated) {
		this.colorsTotal = colorsTotal;
		this.isAnimated = isAnimated;
		this.swatches = new Array();
		for (let i = 0; i < colorsTotal; i++) {
			this.swatches.push(
				new Color('rgb(200, 200, 200)', 
						  1, i, colorsTotal, true));
		}
	}
	generateForm() {
		const form = document.createElement('form');
		this.isAnimated
			? form.setAttribute('class', 'palette-form palette-loader')
			: form.setAttribute('class', 'palette-form')
		this.swatches.forEach((c, i) => {
			const input = c.generateInput();
			let delay;
			this.colorsTotal <= 4
				? delay = .25
				: delay = .125
			input.setAttribute('style', `animation-delay: ${i * delay}s`)
			form.appendChild(input);
		});
		return form;
	}
}


///////////////////////////////////////////////////////////////

const d = JSON.stringify({
		'isInput': true,
		'colorsTotal': 3,
		'pixelsTotal': 3,
		'colors': [
			{
				'rgb': 'rgb(255, 0, 0)',
				'pixels': 1
			},
			{
				'rgb': 'rgb(0, 255, 0)',
				'pixels': 1
			},
			{
				'rgb': 'rgb(0, 0, 255)',
				'pixels': 1
			}		
		]
	});

// const p = new Palette(d);

// const test = document.querySelector('#test');
// test.appendChild(p.generateForm());

///////////////////////////////////////////////////////////////