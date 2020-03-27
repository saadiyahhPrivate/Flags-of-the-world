// Declare constants and variables
var width  = 0;
var height = 0;
redraw();

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

function clearSelections()
{
	svg.selectAll("path")
		.classed('selected', false);
};

function countrySelected()
{
	var d = d3.select(this);
	console.log(d);
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
		createMap(data);
	});
