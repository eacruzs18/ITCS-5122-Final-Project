class Chloropleth {

    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 700,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35}
        };
        this.csvdata = _data;
        this.colorScale = _colorScale;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - 200;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // The svg
        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('id', 'chloropleth')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', vis.config.containerWidth / 2 -50)
            .attr('y', vis.config.margin.top +30)
            .attr('dy', '.71em')
            .style('text-anchor', 'middle')
            .text('Average Salary by Country');

        // Map and projection
        vis.path = d3.geoPath();
        vis.projection = d3.geoMercator()
            .scale(70)
            .center([0,20])
            .translate([vis.width / 2, vis.height / 2]);
   
    }

    updateVis() {
        let vis = this;

        vis.data = new Map(vis.csvdata.map(d => [d['alpha-4'], d.salary_in_usd]))
        console.log(`${vis.data}`);
        vis.colorScale = d3.scaleSequential(d3.interpolateOranges)
            .domain([0, d3.max(vis.csvdata, d => d.salary_in_usd)]);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        // Load external data and boot
        d3.json("data/world.geojson").then(function(topo) {
            // Draw the map
            vis.chart.selectAll("path")
                .data(topo.features)
                .join("path")
                // draw each country
                .attr("d", d3.geoPath().projection(vis.projection))
                // set the color of each country based on salary
                .attr("fill", function (d) {
                    d.total = vis.data.get(d.id) || 0;
                    return vis.colorScale(d.total);
                })
                .on('mouseover', function(event, d) {
                    const formattedSalary = d3.format(',.2f')(d.total);
    
                    tooltip.style('visibility', 'visible')
                        .html(`<strong>Country:</strong> ${d.id}<br><strong>Average Salary:</strong> $${formattedSalary}`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 30) + 'px');
                })
                .on('mouseout', function() {
                    tooltip.style('visibility', 'hidden');
                });
        });

        //legend
        vis.chart.append('text')
            .attr('x', vis.config.containerWidth - 220)
            .attr('y', 190)
            .text('Salary Range');

        vis.chart.append('text')
            .attr('x', vis.config.containerWidth - 150)
            .attr('y', 235)
            .text("$230,000");

        vis.chart.append('text')
            .attr('x', vis.config.containerWidth - 230)
            .attr('y', 235)
            .text('$0');

        const defs = vis.chart.append('defs');

        const gradient = defs.append("linearGradient")
                .attr("id", "svgGradient")
                .attr("x1", "0%")
                .attr("x2", "100%")

        gradient.append("stop")
                .attr("class", "start")
                .attr("offset", "0%")
                .attr("stop-color", d3.interpolateOranges(0))
                .attr("stop-opacity", 1);
                
        gradient.append("stop")
                .attr("class", "mid")
                .attr("offset", "50%")
                .attr("stop-color", d3.interpolateOranges(.5))
                .attr("stop-opacity", 1);

        gradient.append("stop")
                .attr("class", "end")
                .attr("offset", "100%")
                .attr("stop-color", d3.interpolateOranges(1))
                .attr("stop-opacity", 1);

        const legend = vis.chart.append('rect')
                .attr('x', vis.config.containerWidth - 220)
                .attr('y', 200)
                .attr('width', 100)
                .attr('height', 20)
                .attr('fill', "url(#svgGradient)");

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
        
    }
}