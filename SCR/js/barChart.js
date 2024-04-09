class BarChart {
    
    /**
     * class constructor with basic chart configuration
     * @param {Object} _config 
     * @param {Array} _data 
     * @param {d3.Scale} _colorScale 
     */
    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 30, right: 60, bottom: 50, left: 150}
        };
        this.data = _data;
        this.colorScale = _colorScale;
        this.initVis();
    }
    
    /**
     * this function is used to initialize scales/axes and append static elements
     */
    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('id', 'barchart')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2);
        
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]); 

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0);

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.chart.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(vis.yScale)
                .tickSize(-vis.width)
                .tickFormat(''));

        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', vis.config.containerWidth / 2)
            .attr('y', vis.config.containerHeight - 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'middle')
            .text('Experience Level');

        vis.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', vis.config.containerWidth / 2)
            .attr('y', vis.config.margin.top / 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'middle')
            .text('Salary by Employment Type');    

        vis.updateVis();         
    }
    
    /**
     * this function is used to prepare the data and update the scales before we render the actual vis
     */
    updateVis() {
        let vis = this;

        const salaryByType = d3.rollups(vis.data, 
            group => d3.sum(group, d => d.salary), 
            d => d.experience_level
        );

        vis.aggregatedData = Array.from(salaryByType, ([key, value]) => ({
            key: key,
            value: value
        }));

        vis.xScale.domain(vis.aggregatedData.map(d => d.key));
        vis.yScale.domain([0, d3.max(vis.aggregatedData, d => d.value)]);

        vis.renderVis();
    }

    /**
     * this function contains the d3 code for binding data to visual elements
     */
    renderVis() {
        let vis = this;

        const bars = vis.chart.selectAll('.bar')
            .data(vis.aggregatedData);

        bars.enter().append('rect')
            .attr('class', 'bar') 
            .merge(bars)
            .attr('x', d => vis.xScale(d.key))
            .attr('y', d => vis.yScale(d.value))
            .attr('width', vis.xScale.bandwidth())
            .attr('height', d => vis.height - vis.yScale(d.value));

        // Remove excess bars
        bars.exit().remove();

        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
}
