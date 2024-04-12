class Chloropleth {

    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35}
        };
        this.data = _data;
        this.colorScale = _colorScale;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // The svg
        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('id', 'chloropleth')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Map and projection
        const path = d3.geoPath();
        const projection = d3.geoMercator()
            .scale(70)
            .center([0,20])
            .translate([vis.width / 2, vis.height / 2]);

        // Data and color scale
        let data = new Map()
        const colorScale = d3.scaleThreshold()
            .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
            .range(d3.schemeBlues[7]);

        // Load external data and boot
        Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv('data/detailedata.csv', function(d) {
            data.set(d['alpha-3'], +d.salary_in_usd)
        })
        ]).then(function(loadData){
            let topo = loadData[0]

            // Draw the map
        vis.chart.append("g")
            .selectAll("path")
            .data(topo.features)
            .join("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            })
        });
    }

    updateVis() {

    }

    renderVis() {

    }
}