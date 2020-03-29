// Declare constants and variables
var width  = 0;
var height = 0;
redraw();

var selectedCountries = [];

// var flagimage = document.getElementById("imageid");

const svg = d3.select('#map').append('svg')
	.attr('width', width)
	.attr('class', "roundedcornersmap");
// const countryName = d3.select('#countryname');


// Filter-related variables
const colors = ['Red', 'Green', 'Blue', 'Gold', 'White', 'Black', 'Orange']
// const colors = new Map(
// 	[["red", 1],["green",2],["blue",3],["gold",4],["white",5],["black",6],["orange",7]]);
// const shapes = ['Circles', 'Crosses', 'Saltires', 'Quarters', 'Sunstars', 'Crescent', 'Triangle', 'Icon', 'Animate', 'Text']
// const shapes = new Map(
// 	[["circles", 1],["crosses",2],["saltires",3],["quarters",4],["sunstars",5],["crescent",6],["triangle",7],["icon",8],["animate",9],["text",10]]);

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var projection = d3.geoMercator()
	.scale(300)
	.translate([width / 2, height / 1.5]);

var path = d3.geoPath()
	.projection(projection);

function countrySelected()
{
	var d = d3.select(this);
	if (d.classed('selected')) {
			d.classed('selected', false);
	} else {
			d.classed('selected', true);
	}

	updateHistograms();
	// updateFlagDisplay();
};

function updateFilter() {
	var d = d3.select(this);
	var selectedColor = this.textContent;

	// update button visual
	d.classed('selected', !d.classed('selected'));
	d.attr('font-weight', (d.classed('selected') ? 'bold' : 'normal'))

	// recalculate selected countries
	var activeFilters = d3.selectAll('#filters .selected');
	var selected = mapdata;
	activeFilters.each(function(filt) {
		selected = selected
			.filter(d => d.properties[filt] != 0)
	})

	svg.selectAll('path')
		.classed('selected', false)
	if (!activeFilters.empty()) {
		selected.forEach(function(d) {
			svg.select('#'+d.properties.Name.split(' ').join(''))
				.classed('selected', true)
		})
	}
	
	// update flag display on right
	updateFlagDisplay(selected)
}

function updateFlagDisplay(selection) {
	// var selected = svg.selectAll('path.selected')
	// if (selected.empty()) {selected = svg.selectAll('path')};
	// console.log(selected);

	// TODO need to figure out how to bind svg map data with flag data

	d3.selectAll('#flagdisplay img').remove()

	var flags = d3.select('#flagdisplay')
			.selectAll('img')
			// .data(selected, function(d) {return d ? d.properties.ImageURL : this.src})
			.data(selection)

	flags
		.enter()
		.append('img')
		.attr('src', d => d.properties.ImageURL)
		.attr('height', 20)
		.attr('width', 30)
}

function zoomed() {
	svg.select('g')
		.attr('transform', d3.event.transform)
		.style("stroke-width", 1 / d3.event.transform.k + "px");
}

function clearSelections()
{
	// clear all user selections on the map
	svg.selectAll("path")
		 .classed('selected', false);

	// clear the selected landmasses as well!
	landmassesSelected = [];
	[].forEach.call(document.getElementsByClassName("landmass-checkbox"),
									function (el) {el.checked = false});

	updateHistograms();
	updateFlagDisplay(mapdata);
};

function updateLandmassSelections(landmasses_selected, landmasses_unselected)
{
	svg.selectAll("path")
		 .filter(function(d) {return landmasses_selected.includes(d.properties.Landmass);})
		 .classed('selected', true);

	svg.selectAll("path")
		 .filter(function(d) {return landmasses_unselected.includes(d.properties.Landmass);})
		 .classed('selected', false);

	updateHistograms();
	// updateFlagDisplay();
};

var landmasses = new Map(
	[["north-america", 1],["south-america",2],["europe",3],["africa",4],["asia",5],["oceania",6]]);
var landmassesSelected = [];
d3.select("#landmasschoices").on("input", function() {
	let landmassesUnselected = [];
	landmasses.forEach((landmassid, landmass) => {
		var doc_element = document.getElementById(landmass);
		if (doc_element.checked) {
			if (landmassesSelected.indexOf(landmassid) == -1) {
				landmassesSelected.push(landmassid);
			}
		} else {
			if (landmassesSelected.includes(landmassid)) {
				landmassesUnselected.push(landmassid);
			}
			const index = landmassesSelected.indexOf(landmassid);
			if (index > -1) {
			  landmassesSelected.splice(index, 1);
			}
		}
	});

	// update selections
	updateLandmassSelections(landmassesSelected, landmassesUnselected);
});

function createMap(data) {
	mapdata = topojson.feature(data, data.objects.merged_countries).features;
	var zoom = d3.zoom()
		.scaleExtent([0.4, 100])
		.on('zoom', zoomed)

	svg.attr("preserveAspectRatio", "xMidYMid")
	   .attr("viewBox", "0 0 " + width + " " + height);

	var view = svg.append("rect")
		 .attr("class", "background")
		 .attr("width", width)
		 .attr("height", height);

	var g = svg.append("g");
	svg.selectAll("g")
		.append("g")
		.selectAll("path")
		.data(mapdata)
		.enter()
		.append("path")
		.attr("id", function(d) { return d.properties.Name.split(' ').join(''); })
		.attr("d", path)
		.attr("class", "country")
		.on("click", countrySelected)
		.on("mouseover", function(d) {
		 div.transition()
				 .duration(200)
				 .style("opacity", .9);
		 div.html(d.properties.Name + "<br/>" +
		 			'<img src= "' + d.properties.ImageURL + '"' +
					" height='50' width='auto' border='1'>")
				 .style("left", (d3.event.pageX) + "px")
				 .style("top", (d3.event.pageY + 25) + "px");
		 })
		 .on("mouseout", function(d) {
				 div.transition()
						 .duration(500)
						 .style("opacity", 0);
		 });

	svg.call(zoom);

	// Filters
	d3.select('#filters').append('svg')
		.selectAll('text.filter-label')
		.data(colors)
		.enter()
		.append('text')
		.attr('class', 'filter-label')
		.attr('id', d => d)
		.attr('x', function(d,i) {return i/8*width})
		.attr('y', 30)
		.attr('fill', d => d)
		.attr('text-anchor', 'start')
		.text(d => d)
		.on('click', updateFilter);

	// Flag display
	updateFlagDisplay(mapdata);
};

function redraw()
{
	width = d3.select('#map').node().getBoundingClientRect().width;
	height = width * 0.6;
};

function 	updateHistograms()
{
	svg.selectAll("path.selected") // selects all the countries highlighted ()
			// now we have all the countries highlighted, we can use them to draw the histograms!
			// just an example filter to see all the selected countries logged to console
		 .filter(function(d) {console.log(d.properties.Name); return true;});
};

window.addEventListener("resize", redraw);

d3.json('data/merged_countries_simplified.json', function(err, data) {
		// store map of countries
		// mapdata = data.objects.merged_countries.geometries;
		createMap(data);
});
