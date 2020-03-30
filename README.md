# A4-Flags-of-the-World

## Running the Visualization

Open Terminal in this directory and run `python3 -m http.server 5000`. Then navigate to http://localhost:5000

## Features

- Select color(s) and see all countries that have that color in the flag
- Select continent/region and see the breakdown of color frequency in that region
  - Above two can be done for other variables (such as various shapes, whether the flag contains text, etc.)
- Select a single country to see its flag and features (number of colors, main hue, bars/stripes/shapes, etc.)



- flag-level information
  - click on / hover over canada -> has two colors, red and white; has three bars; has animate object
- region-level information
  - select africa -> average number of colors; most common color; percentage with crescent shape, average number of bars
- color-level information
  - select red, blue -> countries with BOTH colors in flag
- shape-level information
  - select crescent -> countries with crescent in flag; most common color among those; frequency per continent
- combination
  - select europe, blue, crosses -> flag display