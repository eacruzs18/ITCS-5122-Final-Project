d3.csv('data/salaries.csv').then(_data => {
    data = _data;

    // Convert string columns to appropriate data types
    data.forEach(d => {
       d.work_year = +d.work_year;
       d.salary = +d.salary;
       d.remote_ratio = +d.remote_ratio;
       d.company_size = +d.company_size;
    });

    const filteredData = _data.filter(d =>
        !isNaN(d.work_year) &&
        !isNaN(d.experience_level) &&
        !isNaN(d.salary) &&
        !isNaN(d.remote_ratio) &&
        !isNaN(d.company_size)
    );

    barchart = new BarChart({parentElement: '#barchart'}, data);
    barchart.updateVis();

    parallelcoordinates = new ParallelCoordinates({parentElement: '#parallelcoordinates'}, data);
    parallelcoordinates.updateVis();

    
})
.catch(error => console.error(error));