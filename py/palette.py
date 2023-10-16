###############################################
# palette.py
# functions for palette manipulations
###############################################

from PIL import Image, ImageFilter, ImageOps
import numpy as np
import json

###############################################

def get_dominant_palette(img, colors_out, is_input):

	img = img.convert('RGB')
	if is_input:
		# img = img.filter(ImageFilter.GaussianBlur(radius = 5))
		# img.show()
		img = ImageOps.posterize(img, 3)
		# img.show()
		img = img.reduce(2)
	# img.show()
	palette = img.getcolors(maxcolors = img.width * img.height)
	palette_array = np.array(palette, dtype = object)

	primary_count = 0
	sec_count = 0
	tert_count = 0

	primary_rgb = (0, 0, 0)
	sec_rgb = (0, 0, 0)
	tert_rgb = (0, 0, 0)

	for p in palette_array:
		if p[0] > primary_count:
			primary_count = p[0]
			primary_rgb = p[1]
		elif p[0] > sec_count:
			sec_count = p[0]
			sec_rgb = p[1]
		elif p[0] > tert_count:
			tert_count = p[0]
			tert_rgb = p[1]

	dict = {}

	threshold = 0 # minimum number of pixels with same color
	if is_input: 
		threshold = 5

	for a in palette_array:
		if a[0] > threshold:
			if a[0] in dict.keys():
				dict[a[0]].append(a[1])
			else:
				dict[a[0]] = [a[1]]

	list = []
	for k in dict:
		# print("START FOR")
		# print('\tk', k)
		# print(f'\tdict[{k}]', dict[k])
		# print(f'\tlen(dict[{k}])', len(dict[k]))
		if len(dict[k]) > 1:
			# print("LEN > 1")
			for i in range(len(dict[k])):
				# print(f'\t\tdict[{k}][{i}]', dict[k][i])
				# print(f'\t\t\t[{k}, dict[{k}][{i}]]', [k, [dict[k][i]]])
				list.append([k, [dict[k][i]]])
		elif len(dict[k]) == 1:
			# print("LEN == 1")
			# print(f'\t[{k}, dict.get({k})]', [k, dict.get(k)])
			list.append([k, dict.get(k)])
		else:
			print('Error, color key of length 0.')

	list = sorted(list, reverse=True)
	# print('list')
	# print(list)

	palette = {
		'isInput': is_input,
		'colorsTotal': len(list),
		'pixelsTotal': img.width * img.height,
		'colors': []
	}

	count = min(len(list), colors_out)
	for c in range(count):
		palette['colors'].append({
				'rgb': 'rgb{}'.format(list[c][1][0]),
				'pixels': list[c][0]
			})

	return palette

###############################################