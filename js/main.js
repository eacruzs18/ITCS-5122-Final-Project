let data;
let scatterplot, barchart, chloropleth;


d3.csv('data/salarieswithcostoflivingdata.csv').then(_data => {
    data = _data;
    data.forEach(d => {
        d.salary = +d['salary_in_usd'];
        d.costofliving = +d['NumbeoCoL2023'];
        d.country = d['company_location'];
    });


    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    scatterplot = new ScatterPlot({
        parentElement: '#scatterplot'
    }, data, colorScale);
    scatterplot.updateVis();

    barchart = new BarChart({
        parentElement: '#barchart'
    }, data, colorScale);
    
   chloropleth = new Chloropleth({
        parentElement: '#chloropleth'
    }, data, colorScale);
    chloropleth.updateVis();

}).catch(error => console.error(error));