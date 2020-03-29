// Declare constants and variables
var width  = 0;
var height = 0;
redraw();

var mapdata = {};

// var flagimage = document.getElementById("imageid");

const svg = d3.select('#map').append('svg')
	.attr('width', width)
	.attr('class', "roundedcornersmap");
const countryName = d3.select('#countryname');

const colors = ['Red', 'Green', 'Blue', 'Gold', 'White', 'Black', 'Orange']
const shapes = ['Circles', 'Crosses', 'Saltires', 'Quarters', 'Sunstars', 'Crescent', 'Triangle', 'Icon', 'Animate', 'Text']

const filt = d3.select('#filters').append('svg');

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

	updateHistograms();
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
	height = width * 0.6;
};

function updateHistograms()
{
    d3.select("#histoarea").selectAll("svg").remove();

	var selected_data = svg.selectAll("path.selected"); // selects all the countries currently highlighted

    var histo_data = [
        {color:"Red", count:selected_data.filter(function(d) {return (d.properties.Red === 1);}).size()},
        {color:"Green", count:selected_data.filter(function(d) {return (d.properties.Green === 1);}).size()},
        {color:"Blue", count:selected_data.filter(function(d) {return (d.properties.Blue === 1);}).size()},
        {color:"Gold", count:selected_data.filter(function(d) {return (d.properties.Gold === 1);}).size()},
        {color:"White", count:selected_data.filter(function(d) {return (d.properties.White === 1);}).size()},
        {color:"Black", count:selected_data.filter(function(d) {return (d.properties.Black === 1);}).size()},
        {color:"Orange", count:selected_data.filter(function(d) {return (d.properties.Orange === 1);}).size()},
    ];

    var hmargin = {top: 10, right: 30, bottom: 30, left: 40},
    hwidth = 400 - hmargin.left - hmargin.right,
    hheight = 400 - hmargin.top - hmargin.bottom;

    var max_val = d3.max(histo_data, function(d) {return d.count});

    var x = d3.scaleBand()
      .domain(colors)
      .range([0, hwidth])
      .padding(0.1);

    var y = d3.scaleLinear()
      .domain([0, max_val])
      .range([hheight, 0]);
    
    var hsvg = d3.select("#histoarea").append("svg")
        .attr("width", hwidth + hmargin.left + hmargin.right)
        .attr("height", hheight + hmargin.top + hmargin.bottom)
        .append("g")
        .attr("transform", 
            "translate(" + hmargin.left + "," + hmargin.top + ")");
    
    hsvg.selectAll(".bar")
          .data(histo_data)
        .enter().append("rect")
          .attr("class", "bar")
        .attr("x", function(d) { return x(d.color); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return hheight - y(d.count); })
        .attr("fill", function(d) {return d.color});

    // add the x Axis
    hsvg.append("g")
        .attr("transform", "translate(0," + hheight + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    hsvg.append("g")
        .call(d3.axisLeft(y));
};

window.addEventListener("resize", redraw);

d3.json('data/merged_countries_simplified.json', function(err, data) {
		// store map of countries
		mapdata = data.objects.merged_countries.geometries;
		createMap(data);
});
