# slic.py
# testing SLIC superpixels

from pathlib import Path
from PIL import Image

import matplotlib.pyplot as plt
import numpy as np

from skimage.data import astronaut
from skimage.color import rgb2gray
from skimage.filters import sobel
from skimage.segmentation import slic
from skimage.segmentation import mark_boundaries
from skimage.util import img_as_float

# path = Path('./tests/human/01_child.jpg')
# print(path.absolute())
# img = img_as_float(Image.open(path.absolute()))
img = img_as_float(astronaut()[::2, ::2])

segments_slic = slic(img, n_segments=300, compactness=10, sigma=1, start_label=1)
gradient = sobel(rgb2gray(img))

print(f"SLIC number of segments: {len(np.unique(segments_slic))}")

fig, ax = plt.subplots(1, 1)

ax.imshow(mark_boundaries(img, segments_slic))
ax.set_title("SLIC")
ax.tick_params(axis='both', grid_alpha=0)
ax.set_axis_off()

plt.tight_layout()
plt.show()
