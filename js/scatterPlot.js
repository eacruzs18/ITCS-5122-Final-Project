class ScatterPlot {
    /** 
     * class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     * @param {d3.Scale}
     */
    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {
                top: 25,
                right: 20,
                bottom: 20,
                left: 35
            },
            tooltipPadding: _config.tooltipPadding || 15
        };
        this.data = _data;
        this.colorScale = _colorScale;

        this.initVis();
    }

    /**
     * initialize the scales and axes and add svg and g elements 
     * and text elements for the visualization
     */
    initVis() {
        let vis = this;

        // calculate inner chart size; margin specifies the space around the actual chart
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // add the svg element and define the size of drawing area 
        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);


        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        const xAxisFormat = d3.format('$.0f');

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickSize(-vis.height - 10)
            .tickPadding(10)
            .tickFormat(xAxisFormat);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSize(-vis.width - 10)
            .tickPadding(10);

        // append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.countryData = d3.group(vis.data, d => d.country);

        vis.countryAverages = Array.from(vis.countryData, ([country, values]) => {
            const averageSalary = d3.mean(values, d => d.salary);
            const averageCostOfLiving = d3.mean(values, d => d.costofliving);
            return {
                country,
                averageSalary,
                averageCostOfLiving
            };
        });

        // add axis title for Y
        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', 35)
            .attr('dy', '0.71em')
            .text('Cost Of Living');

        // add axis title for X
        vis.chart.append('text')
            .attr('class', 'axis-title')
            .attr('x', vis.width + 15)
            .attr('y', vis.height - 15)
            .attr('dy', '0.71em')
            .style('text-anchor', 'end')
            .text('Salary In USD');

        vis.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', vis.config.containerWidth / 2)
            .attr('y', vis.config.margin.top / 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'middle')
            .text('Cost of living / Salary Comparison');
    }

    /**
     * prepare and update the data and scales before we render the chart
     */
    updateVis() {
        let vis = this;

        vis.xScale.domain([0, d3.max(vis.countryAverages, d => d.averageSalary)]).nice();
        vis.yScale.domain([0, d3.max(vis.countryAverages, d => d.averageCostOfLiving)]).nice();


        vis.renderVis();
    }

    /**
     * bind data to visual elements
     */
    renderVis() {
        let vis = this;

        // add circles
        const bubbles = vis.chart
            .selectAll('.point')
            .data(vis.countryAverages)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cx', d => vis.xScale(d.averageSalary))
            .attr('cy', d => vis.yScale(d.averageCostOfLiving))
            .attr('fill', 'steelblue')
            .on('mouseover', function(event, d) {
                const formattedSalary = d3.format(',.2f')(d.averageSalary);
                const formattedCost = d3.format(',.2f')(d.averageCostOfLiving);

                console.log(`Hovered over ${d.country} - Average Salary: $${formattedSalary}, Average Cost of Living: $${formattedCost}`);

                tooltip.style('visibility', 'visible')
                    .html(`<strong>Country:</strong> ${d.country}<br><strong>Average Salary:</strong> $${formattedSalary}<br><strong>Average Cost of Living:</strong> ${formattedCost}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 30) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('visibility', 'hidden');
            });

        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('padding', '5px')
            .style('border', '1px solid #ddd')
            .style('border-radius', '3px')
            .style('box-shadow', '0 1px 3px rgba(0,0,0,0.3)')
            .style('pointer-events', 'none')
            .style('visibility', 'hidden');

        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove()); // remove axis and only show the gridline

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove()); // remove axis and only show the gridline



    }
}