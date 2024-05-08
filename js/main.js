let data;
let scatterplot, barchart, chloropleth;
let expFilter = [];

const dispatcher = d3.dispatch('filterExp');

d3.csv('data/new_cost_of_living.csv').then(_data => {
    data = _data;
    data.forEach(d => {
        d.salary = +d['salary_in_usd'];
        d.costofliving = +d['NumbeoCoL2023'];
        d.country = d['company_location'];
        d.alpha3 = d['alpha-4'];
    });

    const uniqueCountries = Array.from(new Set(data.map(d => d.country)));
    const select = d3.select('#countrySelector')

    select.selectAll('option.country')
        .data(uniqueCountries)
        .enter()
        .append('option')
        .classed('country', true)
        .attr('value', d => d)
        .text(d => d);

    d3.select('#countrySelector').on('change', function() {
        const selectedCountry = d3.select(this).property('value');
        barchart.updateVis(selectedCountry)
    })

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    scatterplot = new ScatterPlot({
        parentElement: '#scatterplot'
    }, data, colorScale);
    scatterplot.updateVis();

    barchart = new BarChart({
        parentElement: '#barchart'

    }, data, colorScale, dispatcher);

    chloropleth = new Chloropleth({

        parentElement: '#chloropleth'
    }, data, colorScale);
    chloropleth.updateVis();

}).catch(error => console.error(error));

dispatcher.on('filterExp', selectedExp => {
    console.log(`${selectedExp}`);
    if (!selectedExp || selectedExp.length === 0) {
        scatterplot.data = data;
        chloropleth.csvdata = data;
    } else {
        scatterplot.data = data.filter(d => selectedExp.includes(d.experience_level));
        chloropleth.csvdata = data.filter(d => selectedExp.includes(d.experience_level));
    }
    scatterplot.updateVis();
    chloropleth.updateVis();
});