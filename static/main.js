const width = 800,
	height = 500;
const svg = d3.select('div').append('svg')
	.attr('width', width)
	.attr('height', height);

function createMap(data) {
	console.log('createMap');

	// Dummy code
	// Currently, randomly generates a dot for each entry.
	// Hover over the dot to see name of the entry
	
	svg.append('text')
		.attr('id', 'countryname')
		.attr('x', 20)
		.attr('y', 20)
		.attr('fill', 'blue')
		.text('Choose a dot!')

	const g = svg.selectAll('g')
		.data(data.features)
		.enter()
		.append('g')
		.attr('transform', 'translate(50,50)')


	g.append('circle')
		.attr('cx', d => Math.random() * (width-100))
		.attr('cy', d => Math.random() * (height-100))
		.attr('r', 5)
		.attr('fill', 'blue')
		.on('mouseover', function(d,i) {
			svg.select('#countryname')
				.text(d.properties.Name);
		})

	//TODO
}