// Declare constants and variables
var width  = 0;
var height = 0;
redraw();

const svg = d3.select('#map').append('svg')
	.attr('width', width)
	.attr('class', "roundedcornersmap");

// Filter-related variables
const colors = ['Red', 'Green', 'Blue', 'Gold', 'White', 'Black', 'Orange']
// const colors = new Map(
// 	[["red", 1],["green",2],["blue",3],["gold",4],["white",5],["black",6],["orange",7]]);
const shapes = ['Bars', 'Stripes', 'Circles', 'Crosses', 'Saltires', 'Quarters', 'Sunstars',
				'Crescent', 'Triangle', 'Icon', 'Animate', 'Text']
// const shapes = new Map(
// 	[["circles", 1],["crosses",2],["saltires",3],["quarters",4],["sunstars",5],["crescent",6],["triangle",7],["icon",8],["animate",9],["text",10]]);
const landmasses = new Map(
	[["north-america", 1],["south-america",2],["europe",3],["africa",4],["asia",5],["oceania",6]]);

const filters = colors.concat(shapes)

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
	d.classed('selected', !d.classed('selected'));

	updateHistograms();
	updateFlagDisplay();
};

function updateFilter() {
	// apply filters
	var selected = mapdata;
	var filterExists = false;

	landmasses.forEach((landmassid, landmass) => {
		var doc_element = document.getElementById(landmass);
		if (!doc_element.checked) {
			selected = selected.filter(d => d.properties.Landmass != landmassid)
		} else {
			filterExists = true;
		}
	})
	// if no landmass selected, use the entire data to filter
	if (selected.length == 0) selected = mapdata;

	filters.forEach((filter) => {
		var x = document.getElementById(filter);
		if (document.getElementById(filter).checked) {
			selected = selected.filter(d => d.properties[filter] != 0)
			filterExists = true;
		}
	})

	svg.selectAll('path')
		.classed('selected', false)
	if (filterExists) {
		selected.forEach(d => {
			svg.select('#'+d.properties.Name.split(' ').join(''))
				.classed('selected', true)
		})
	}

	// update histograms and flag display
	updateHistograms();
	updateFlagDisplay();

	// return selected countries
	return selected;
}

function updateFlagDisplay() {
	d3.selectAll('#flagdisplay img')
		.style('display', d => {
			var x = d3.select('#'+d.properties.Name.split(' ').join(''))
			return (x.classed('selected') ? 'inline' : 'none')
		})
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

	// clear filters and landmass selections
	d3.selectAll('input')
		.property('checked', false)

	updateHistograms();
	updateFlagDisplay();
};

d3.select("#landmasschoices").on('change', updateFilter)
d3.select('#filters').on('change', updateFilter)

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
		.attr('fill', d => d.properties.Mainhue)
		.on("click", countrySelected)
		.on("mouseover", function(d) {
		 div.transition()
				.duration(200)
				.style("opacity", 0.9);
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

	// Flag display
	d3.select('#flagdisplay').selectAll('img')
		.data(mapdata)
		.enter()
		.append('img')
		.attr('src', d => d.properties.ImageURL)
		.attr("style", "padding: 2px;")
		.attr('height', 20)
		.attr('width', 30)
		.style('display', 'none')
		.on('mouseover', function(d) {
			div.transition()
				.duration(200)
				.style("opacity", 1);
		 	div.html(d.properties.Name + "<br/>" +
		 			'<img src= "' + d.properties.ImageURL + '"' +
					" height='50' width='auto' border='1'>")
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY + 25) + "px");
		})
		.on('mouseout', function(d) {
			div.transition()
				.duration(500)
				.style('opacity', 0)
		})

    updateHistograms();
};

function redraw()
{
	width = d3.select('#map').node().getBoundingClientRect().width;
	height = width * 0.55;
};

function updateHistograms()
{
    // Color Flag Histogram
    d3.select("#histoarea").selectAll("svg").remove();

	var selected_data = svg.selectAll("path.selected"); // selects all the countries currently highlighted

    var color_data = [
        {color:"Red", count:selected_data.filter(function(d) {return (d.properties.Red === 1);}).size()},
        {color:"Green", count:selected_data.filter(function(d) {return (d.properties.Green === 1);}).size()},
        {color:"Blue", count:selected_data.filter(function(d) {return (d.properties.Blue === 1);}).size()},
        {color:"Gold", count:selected_data.filter(function(d) {return (d.properties.Gold === 1);}).size()},
        {color:"White", count:selected_data.filter(function(d) {return (d.properties.White === 1);}).size()},
        {color:"Black", count:selected_data.filter(function(d) {return (d.properties.Black === 1);}).size()},
        {color:"Orange", count:selected_data.filter(function(d) {return (d.properties.Orange === 1);}).size()}
    ];

		var div_width = d3.select('#histoarea').node().getBoundingClientRect().width;
    var hmargin = {top: 10, right: 30, bottom: 50, left: 40},
    hwidth = div_width - hmargin.left - hmargin.right,
    hheight = (div_width * 0.65) - hmargin.top - hmargin.bottom;

    var max_val = d3.max(color_data, function(d) {return d.count});

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

    hsvg.selectAll("text.bar")
          .data(color_data)
        .enter().append("rect")
          .attr("class", "bar")
        .attr("x", function(d) { return x(d.color); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return hheight - y(d.count); })
        .attr("fill", function(d) {return d.color})
        .style("stroke", "black")
        .style("stroke-width", 1)
        .append("text")
        .text(d => d.count);

    hsvg.append("g")
        .attr("transform", "translate(0," + hheight + ")")
        .call(d3.axisBottom(x))
				.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", "rotate(-55)");

    hsvg.append("g")
    .call(d3.axisLeft(y).tickValues(y.ticks()
    .filter(tick => Number.isInteger(tick))).tickFormat(d3.format('d')));

    hsvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - hmargin.left)
        .attr("x",0 - (hheight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# of Countries");

    // Shape Flag Histogram

    var shapes_data = [
        {shape:"Bars", count:selected_data.filter(function(d) {return (d.properties.Bars !== 0);}).size()},
        {shape:"Stripes", count:selected_data.filter(function(d) {return (d.properties.Stripes !== 0);}).size()},
        {shape:"Circles", count:selected_data.filter(function(d) {return (d.properties.Circles !== 0);}).size()},
        {shape:"Crosses", count:selected_data.filter(function(d) {return (d.properties.Crosses !== 0);}).size()},
        {shape:"Saltires", count:selected_data.filter(function(d) {return (d.properties.Saltires !== 0);}).size()},
        {shape:"Quarters", count:selected_data.filter(function(d) {return (d.properties.Quarters !== 0);}).size()},
        {shape:"Sunstars", count:selected_data.filter(function(d) {return (d.properties.Sunstars !== 0);}).size()},
        {shape:"Crescent", count:selected_data.filter(function(d) {return (d.properties.Crescent !== 0);}).size()},
        {shape:"Triangle", count:selected_data.filter(function(d) {return (d.properties.Triangle !== 0);}).size()},
        {shape:"Icon", count:selected_data.filter(function(d) {return (d.properties.Icon !== 0);}).size()},
        {shape:"Animate", count:selected_data.filter(function(d) {return (d.properties.Animate !== 0);}).size()},
        {shape:"Text", count:selected_data.filter(function(d) {return (d.properties.Text !== 0);}).size()}
    ];

    var max_val2 = d3.max(shapes_data, function(d) {return d.count});

    var x2 = d3.scaleBand()
      .domain(shapes)
      .range([0, hwidth])
      .padding(0.1);

    var y2 = d3.scaleLinear()
      .domain([0, max_val2])
      .range([hheight, 0]);

    var hsvg2 = d3.select("#histoarea").append("svg")
    .attr("width", hwidth + hmargin.left + hmargin.right)
    .attr("height", hheight + hmargin.top + hmargin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + hmargin.left + "," + hmargin.top + ")");

    hsvg2.selectAll(".bar")
      .data(shapes_data)
    .enter().append("rect")
      .attr("class", "bar")
    .attr("x", function(d) { return x2(d.shape); })
    .attr("width", x2.bandwidth())
    .attr("y", function(d) { return y2(d.count); })
    .attr("height", function(d) { return hheight - y2(d.count); })
    .attr("fill", "steelblue")
    .style("stroke", "black")
    .style("stroke-width", 1);

    hsvg2.append("g")
    .attr("transform", "translate(0," + hheight + ")")
    .call(d3.axisBottom(x2))
		.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-55)");

    hsvg2.append("g")
    .call(d3.axisLeft(y2).tickValues(y2.ticks()
    .filter(tick => Number.isInteger(tick))).tickFormat(d3.format('d')));

    hsvg2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - hmargin.left)
        .attr("x",0 - (hheight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# of Countries");
};

window.addEventListener("resize", redraw);
window.addEventListener("resize", updateHistograms);

d3.json('data/merged_countries_simplified.json', function(err, data) {
		createMap(data);
});
