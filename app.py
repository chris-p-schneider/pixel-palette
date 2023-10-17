###############################################
# app.py
###############################################

from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename
from io import BytesIO
from PIL import Image
import os, json, time, math
from Pyxeled import pyxeled
from py import palette

###############################################

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.abspath('static/img/output/')
app.config['MAX_CONTENT_PATH'] = 1 * 1024

###############################################

stop_conversion_bool = False

###############################################

def seconds_to_MMSSmm(seconds):
	M = 0
	s = math.floor(seconds)
	m = math.floor((seconds - s) * 100)
	if seconds > 60:
		M = math.floor(seconds / 60)
		s = math.floor(seconds - (M * 60))
		return '{}:{}:{}'.format(str(M).zfill(2), str(s).zfill(2), str(m).zfill(2));
	return '{}:{}'.format(str(s).zfill(2), str(m).zfill(2));

###############################################

@app.route('/')
def main():
	return render_template('mvp.html', 
							title='Pixel-Palettes')

###############################################

@app.route('/canvas')
def canvas():
	return render_template('canvas-test.html', 
							title='Canvas Test')

###############################################

@app.route('/stop-conversion')
def stop_conversion():
	global stop_conversion_bool
	stop_conversion_bool = True
	print('!! stopped conversion !!')
	return
	
###############################################

@app.route('/input_palette', methods=['POST'])
def input_palette():
	print('@/input_palette')
	print(json.dumps(request.form, indent=4))

	if request.files.get('ic-input-upload'):
		print(' --> has file')
		f = request.files['ic-input-upload']
		output_f = secure_filename(f.filename)
		f_bytes = f.read() # convert file to binary
		image = Image.open(BytesIO(f_bytes))
	elif request.form.get('ic-input-sample'):
		print(' --> has sample')
		output_f = request.form['ic-input-sample']
		image = Image.open(os.path.join(os.path.abspath('static/img/samples'), output_f))
	else:
		print('Error retrieving input image!')

	input_palette = palette.get_dominant_palette(image, 16, True)
	print(':: returning input_palette')
	print(json.dumps(input_palette, indent=4))
	return jsonify(input_palette)

###############################################

@app.route('/convert', methods=['POST'])
def convert():
	data = None
	global stop_conversion_bool
	stop_conversion_bool = False
	while not stop_conversion_bool:
		print('@/convert')
		print(json.dumps(request.form, indent=4))
		output_f = 'output.jpg'

		# get image from form submission
		if request.files.get('ic-input-upload'):
			print(' --> has file')
			f = request.files['ic-input-upload']
			output_f = secure_filename(f.filename)
			f_bytes = f.read() # convert file to binary
			image = Image.open(BytesIO(f_bytes))
		elif request.form.get('ic-input-sample'):
			print(' --> has sample')
			output_f = request.form['ic-input-sample']
			image = Image.open(os.path.join(os.path.abspath('static/img/samples'), output_f))
		else:
			print('Error retrieving input image!')

		###########################################################

		if ((request.form.get('ic-output-w') 
				and request.form.get('ic-output-h')
				and request.form.get('ic-mod-upscale')
				and request.form.get('ic-mod-colors'))):
			print(' --> has w h s')
			# parse data here 🧮
			output_w = int(request.form.get('ic-output-w'))
			output_h = int(request.form.get('ic-output-h'))
			output_scale = int(request.form.get('ic-mod-upscale'))
			num_colors = int(request.form.get('ic-mod-colors'))
			scaled_w = output_w * output_scale
			scaled_h = output_h * output_scale
			print(f' --> pixel dimensions: ({output_w} x {output_h})')
			print(f' --> scaled dimensions: ({scaled_w} x {scaled_h})')

			###########################################################
			# call Pyxeled here 💬
			start_time = time.time()
			pixel_image = pyxeled.pyxeled(image, output_w, output_h, num_colors)
			if pixel_image:
				# upscale image here 🔎
				image_upscaled = pixel_image.resize((scaled_w, scaled_h), Image.NEAREST)
				upscaled_path = os.path.join(os.path.abspath('static/img/output/'), secure_filename(output_f))
				image_upscaled.save(upscaled_path, 'png')

				output_palette = palette.get_dominant_palette(pixel_image, num_colors, False)

				end_time = time.time()			
				total_time = seconds_to_MMSSmm(end_time - start_time)
				print(f'TOTAL TIME: {total_time}')

		###########################################################
		# return data here 🎁
		data = {}
		data['request'] = request.form
		if total_time:
			data['time'] = total_time
		if output_palette:
			data['outPalette'] = output_palette
		if upscaled_path:
			data['outputImg'] = url_for('static', filename=f'img/output/{output_f}')
		
		print(':: returning conversion:')
		print(json.dumps(data, indent=4))
		stop_conversion_bool = True
	
	return jsonify(data)

###############################################

if __name__ == '__main__':
    app.run(debug=True)

###############################################