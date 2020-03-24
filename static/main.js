var width  = d3.select('#map').node().getBoundingClientRect().width;
var height = width * 0.6;

const svg = d3.select('#map').append('svg')
	.attr('width', width)
	.attr('height', height);
const countryName = d3.select('#countryname');

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

// this function is just for debugging purposes,
// once we have all country data, this can be scrapped
function checkProperty(d) {
	if (d.properties.Name == null && d.properties.ImageURL == null) {
		return "misingbothcountry";
  } else if (d.properties.Name == null) {
		return "nodatacountry";
	} else if (d.properties.ImageURL == null) {
		return "noflagcountry";
	} else {
		return "countries";
	}
};

function createMap(data)
{
    var projection = d3.geoMercator()
        .scale(300)
        .translate([width / 2, height / 1.5]);

    var path = d3.geoPath()
  							 .projection(projection);

		var zoom = d3.zoom()
		.scaleExtent([0.4, 10])
    .on("zoom",function() {
			g.attr('transform', d3.event.transform)
			g.style("stroke-width", 0.5 / d3.event.transform.k + "px");
    });

		countryName.append('text')
			.attr('id', 'countryname')
			.attr('x', 20)
			.attr('y', 20)
			.attr('fill', 'blue')
			.text('Country Name!')

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
		 .data(topojson.feature(data, data.objects.merged_countries_union).features)
		 .enter()
		 .append("path")
		 .attr("id", function(d) { return d.properties.ADMIN; })
		 .attr("d", path)
		 .on('mouseover', function(d,i) {
			d3.select('#countryname')
				.text(d.properties.ADMIN);
			})
			.attr("class", d => checkProperty(d))
			.on("click", countrySelected);

			svg.call(zoom);
};

function redraw()
{
	width = d3.select('#map').node().getBoundingClientRect().width;
	svg.attr('width', width);
};

window.addEventListener("resize", redraw);
