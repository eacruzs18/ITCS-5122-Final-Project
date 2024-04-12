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


    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

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

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickSize(-vis.height - 10)
            .tickPadding(10);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSize(-vis.width - 10)
            .tickPadding(10);

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', 25)
            .attr('dy', '0.71em')
            .text('Cost Of Living');

        vis.chart.append('text')
            .attr('class', 'axis-title')
            .attr('x', vis.width + 10)
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
            .text('Cost of Living vs. Average Salary by Country');

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
    }


    updateVis() {
        let vis = this;

        vis.xScale.domain([0, d3.max(vis.countryAverages, d => d.averageSalary)]).nice();
        vis.yScale.domain([0, d3.max(vis.countryAverages, d => d.averageCostOfLiving)]).nice();

        vis.renderVis();
    }


    renderVis() {
        let vis = this;

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

                tooltip.style('visibility', 'visible')
                    .html(`<strong>Country:</strong> ${d.country}<br><strong>Average Salary:</strong> $${formattedSalary}<br><strong>Average Cost of Living:</strong> ${d.averageCostOfLiving}`)
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
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove());
    }



}