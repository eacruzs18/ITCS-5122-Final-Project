class ParallelCoordinates {
    
    /**
     * class constructor with basic chart configuration
     * @param {Object} _config 
     * @param {Array} _data 
     * @param {d3.Scale} _colorScale 
     */
    constructor(_config, _data, _colorScale, _barChart) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35}
        };
        this.data = _data;
        this.colorScale = _colorScale;
        this.barChart = _barChart; 
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('id', 'parallelplot')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.dimensions = ['body_mass_g', 'flipper_length_mm', 'culmen_depth_mm', 'culmen_length_mm'];

        vis.yScales = {};
        vis.dimensions.forEach(dimension => {
            vis.yScales[dimension] = d3.scaleLinear()
                .domain(d3.extent(vis.data, d => +d[dimension]))
                .range([vis.height, 0]);
        });

        vis.dimensions.forEach((dimension, i) => {
            let axis = d3.axisLeft(vis.yScales[dimension]);
            vis.chart.append('g')
                .attr('class', 'y-axis')
                .attr('transform', `translate(${i * vis.width / vis.dimensions.length},0)`)
                .call(axis)
                .append('text')
                .attr('class', 'axis-title')
                .attr('transform', `translate(-10,${vis.height / 2}) rotate(-90)`)
                .attr('dy', '-1.5em')
                .style('text-anchor', 'middle')
                .text(dimension);
        });
    }

    updateVis() {
        let vis = this;

        vis.renderVis();
    }
 
    renderVis() {
        let vis = this;

        vis.chart.selectAll('.line')
        .data(vis.data)
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('d', d => {
            return d3.line()
            (vis.dimensions.map(
                dim => [vis.width * (vis.dimensions.indexOf(dim) / (vis.dimensions.length - 1)), 
                vis.yScales[dim](d[dim])]));
        })
        .attr('stroke', "#69b3a2")
        .attr('fill', 'none')
        .on('mouseover', function(event, d) {
            d3.select(this).attr('stroke-opacity', 1);
            vis.barChartarChart.chart.selectAll('.bar')
                .attr('fill-opacity', barData => {
                    return barData.key === d.species ? 1 : 0.3;
                });
        })
        .on('mouseout', function() {
            d3.select(this).attr('stroke-opacity', 0.3);
            vis.barChart.chart.selectAll('.bar').attr('fill-opacity', 0.3);
        });   
    }   
}