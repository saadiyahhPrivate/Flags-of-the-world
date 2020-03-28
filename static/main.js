// Declare constants and variables
var width  = 0;
var height = 0;
redraw();

var mapdata = {};

var flagimage = document.getElementById("imageid");

const svg = d3.select('#map').append('svg')
	.attr('width', width)
	.attr('class', "roundedcornersmap");
const countryName = d3.select('#countryname');

const colors = ['Red', 'Green', 'Blue', 'Gold', 'White', 'Black', 'Orange']
const shapes = ['Circles', 'Crosses', 'Saltires', 'Quarters', 'Sunstars', 'Crescent', 'Triangle', 'Icon', 'Animate', 'Text']

const filt = d3.select('#filters').append('svg')
	.attr('width', width)
	.attr('height', height/3);

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
	// TODO: drive visualization graphs to repaint on these events!
};

function filterSelected()
{
	var d = d3.select(this);
	if (d.classed('selected')) {
			d.classed('selected', false);
	} else {
			d.classed('selected', true);
	}
};

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

	// TODO: trigger histogram changes
};

function updateLandmassSelections(landmasses_selected, landmasses_unselected)
{
	svg.selectAll("path")
		 .filter(function(d) {return landmasses_selected.includes(d.properties.Landmass);})
		 .classed('selected', true);

	svg.selectAll("path")
		 .filter(function(d) {return landmasses_unselected.includes(d.properties.Landmass);})
		 .classed('selected', false);

	// TODO: trigger histogram changes
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
	var zoom = d3.zoom()
		.scaleExtent([0.4, 100])
		.on('zoom', zoomed)

	countryName.append('text')
		.attr('id', 'countryname')
		.attr('x', 20)
		.attr('y', 20)
		.attr('fill', 'blue')
		.text('Hover over a country to see its map!')

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
		.data(topojson.feature(data, data.objects.merged_countries).features)
		.enter()
		.append("path")
		.attr("id", function(d) { return d.properties.Name; })
		.attr("d", path)
		.on('mouseover', function(d) {
			d3.select('#countryname')
				.text(d.properties.Name);
			flagimage.src=d.properties.ImageURL;
			})
			.attr("class", "country")
			.on("click", countrySelected);

	svg.call(zoom);

	filt.selectAll('text.filter-label')
		.data(colors)
		.enter()
		.append('text')
		.attr('class', 'filter-label')
		.attr('x', function(d,i) {return i/8*width})
		.attr('y', 30)
		.attr('fill', 'black')
		.attr('text-anchor', 'start')
		.text(d => d)
		.on('click', filterSelected);
};

function redraw()
{
	width = d3.select('#map').node().getBoundingClientRect().width;
	height = width * 0.5;
};

window.addEventListener("resize", redraw);

d3.json('data/merged_countries_simplified.json', function(err, data) {
		// store map of countries
		mapdata = data.objects.merged_countries.geometries;
		createMap(data);
});
