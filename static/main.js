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

const filt = d3.select('#filters').append('svg');

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
	height = width * 0.6;
};

//var histo_margin = {top: 10, right: 30, bottom: 30, left: 40},
 //   histo_width = 460 - histo_margin.left - histo_margin.right,
  //  histo_height = 400 - histo_margin.top - histo_margin.bottom;

//var histo_svg = d3.select("#histoarea")
 //   .append("svg")
  //    .attr("width", histo_width + histo_margin.left + histo_margin.right)
   //   .attr("height", histo_height + histo_margin.top + histo_margin.bottom)
    //.append("g")
     // .attr("transform",
      //"translate(" + histo_margin.left + "," + histo_margin.top + ")");
  
  // append the svg object to the body of the page
//var histo_svg = d3.select("#histoarea")
 //   .append("svg")
  //    .attr("width", hwidth + hmargin.left + hmargin.right)
  //    .attr("height", hheight + hmargin.top + hmargin.bottom)
  //  .append("g")
   //   .attr("transform",
    //        "translate(" + hmargin.left + "," + hmargin.top + ")");



function updateHistograms()
{
	var selected_data = svg.selectAll("path.selected"); // selects all the countries highlighted ()
			// now we have all the countries highlighted, we can use them to draw the histograms!
			// just an example filter to see all the selected countries logged to console
    
    var histo_data = [
        {color:"Red", count:selected_data.filter(function(d) {return (d.properties.Red === 1);}).size()},
        {color:"Green", count:selected_data.filter(function(d) {return (d.properties.Green === 1);}).size()},
        {color:"Blue", count:selected_data.filter(function(d) {return (d.properties.Blue === 1);}).size()},
        {color:"Gold", count:selected_data.filter(function(d) {return (d.properties.Gold === 1);}).size()},
        {color:"White", count:selected_data.filter(function(d) {return (d.properties.White === 1);}).size()},
        {color:"Black", count:selected_data.filter(function(d) {return (d.properties.Black === 1);}).size()},
        {color:"Orange", count:selected_data.filter(function(d) {return (d.properties.Orange === 1);}).size()},
    ];

    console.log(histo_data);
    var hmargin = {top: 10, right: 30, bottom: 30, left: 40},
    hwidth = 460 - hmargin.left - hmargin.right,
    hheight = 400 - hmargin.top - hmargin.bottom;

    var max = d3.max(histo_data, function(d) {return d.count});
    var x = d3.scaleLinear()
      .domain(colors)
      .range([0, hwidth])

    var y = d3.scaleLinear()
      .domain([0, max])
      .range([hheight, 0]);
    

    var xAxis = d3.axisBottom(x)//tickFormat(function(d){ return d.x;});
    //var xAxis = d3.svg.axis()
    //.scale(x)
    //.orient("bottom")
    
    var hsvg = d3.select("#histoarea").append("svg")
    .attr("width", hwidth + hmargin.left + hmargin.right)
    .attr("height", hheight + hmargin.top + hmargin.bottom)
  .append("g")
    .attr("transform", "translate(" + hmargin.left + "," + hmargin.top + ")");

    var bar = hsvg.selectAll(".bar")
    .data(histo_data)
  .enter().append("g")
    .attr("class", "bar")

    bar.append("rect")
    .attr("x", 1)
    .attr("width", 10)
    .attr("height", function(d) { return hheight - y(d.count); })
    .attr("fill", function(d) { return d.color});

//bar.append("text")
 //   .attr("dy", ".75em")
  //  .attr("y", -12)
   // .attr("x", (x(data[0].dx) - x(0)) / 2)
    //.attr("text-anchor", "middle")
   // .text(function(d) { return formatCount(d.y); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + hheight + ")")
    .call(xAxis);

    console.log(histo_data);

    //console.log(d3.sum(selected_data, function(d) {return d.Red;}));
    //console.log(selected_data.filter(function(d) {return (d.properties.Red === 1);}).size());//, d => Number(d.properties.Red)));
    //console.log(selected_data.size());
    //selected_data.filter(function(d) {console.log(d.properties.Name);});   

    selected_data.style("fill", function (d) {return d.properties.Mainhue});

   // var counts = [d]

};

window.addEventListener("resize", redraw);

d3.json('data/merged_countries_simplified.json', function(err, data) {
		// store map of countries
		mapdata = data.objects.merged_countries.geometries;
		createMap(data);
});
