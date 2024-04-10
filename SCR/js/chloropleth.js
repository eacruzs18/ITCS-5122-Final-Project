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
        var projection = d3.geoNaturalEarth1()
                .scale(vis.width / 1.3 / Math.PI)
                .translate([vis.width / 2, vis.height / 2]);

        // Load external data and boot
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(data){

        // Draw the map
        vis.chart.append("g")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
                .attr("fill", "#69b3a2")
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "#fff")
        })
    }
}