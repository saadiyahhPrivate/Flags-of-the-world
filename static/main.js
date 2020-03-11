const width = 600,
	    height = 400
			scale0 = (width - 1) / 2 / Math.PI;

const svg = d3.select('#map').append('svg')
	.attr('width', width)
	.attr('height', height);
const countryName = d3.select('#countryname');

function createMap(data) {
    var projection = d3.geoMercator()
        .scale(300)
        .translate([width / 2, height / 1.5]);

    var path = d3.geoPath()
  							 .projection(projection);

		var zoom = d3.behavior.zoom()
		.scaleExtent([0.3, 10])
    .on("zoom",function() {
        g.attr("transform","translate("+
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("path")
            .attr("d", path.projection(projection));
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
			 // .on("click", country_clicked); to be added later

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

		var g = svg.append("g");
		svg.selectAll("g")
		 .append("g")
		 .selectAll("path")
		 .data(topojson.feature(data, data.objects.merged_countries).features)
		 .enter()
		 .append("path")
		 .attr("id", function(d) { return d.id; })
		 .attr("d", path)
		 .on('mouseover', function(d,i) {
			d3.select('#countryname')
				.text(d.properties.ADMIN);
			})
			.attr("id", d => checkProperty(d));

			svg.call(zoom);
};
