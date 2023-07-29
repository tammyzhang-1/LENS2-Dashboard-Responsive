const svg = d3.select("svg#time-series-chart");
const width = svg.attr("width");
const height = svg.attr("height");
const margin = {top: 25, right: 15, bottom: 60, left: 70};
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

let annotations = svg.append("g").attr("id","annotations"); 
let chartArea = svg.append("g").attr("id","points")
                .attr("transform",`translate(${margin.left},${margin.top})`);

map.on('click', function (e) {
    let clickedCoords = e.latlng
    lastClicked = clickedCoords
    plotData(clickedCoords);      
});

async function plotData(clickedCoords) {
    if (svgPlot.classList.contains('displayed')) {
        annotations.selectAll("*").remove();
        chartArea.selectAll("*").remove();
        svg.selectAll(".label").remove();
    } 

    svgPlot.classList.remove('undisplayed');
    svgPlot.classList.add('displayed');

    let projectedCoords = L.CRS.EPSG3857.project(clickedCoords)
    let latitude = projectedCoords.y;
    let longitude = projectedCoords.x;

    let timeResponse = await fetch('/ts/' + longitude.toString() + '/' + latitude.toString())
    let data = await timeResponse.json(); 
    // data = JSON.parse(data)
    data = data.data

    data.sort((a, b) => a.time - b.time);

    data.forEach( d => {
        d['time'] = Number( d['time']);
        d[currentVariable.value] = Number(d[currentVariable.value]);
    });

    let currentYear = Number(year.value);

    let colorScale = d3.scaleSequential().interpolator(colorbars[colorbar.value]).domain(globalColorLim);

    // construct scales for the x-axis and y-axis based on data range
    const xDomain = d3.extent(data, d => d.time);
    const yDomain = d3.extent(data, d => d[currentVariable.value])
    const timeScale = d3.scaleLinear().domain(xDomain).range([0, chartWidth]);
    const dataScale = d3.scaleLinear().domain(yDomain).range([chartHeight, 0]);

    // construct y-axis
    let leftAxis = d3.axisLeft(dataScale).tickFormat(d3.format(".3s"));
    let leftGridlines = d3.axisLeft(dataScale)
                        .tickSize(-chartWidth-10)
                        .tickFormat("");

    annotations.append("g")
                .attr("class", "y axis")
                .attr("transform",`translate(${margin.left-10},${margin.top})`)
                .call(leftAxis);
    annotations.append("g")
                .attr("class", "y gridlines")
                .attr("transform",`translate(${margin.left-10},${margin.top})`)
                .call(leftGridlines);

    // construct x-axis
    let bottomAxis = d3.axisBottom(timeScale).tickFormat(d3.format("d"))
    let bottomGridlines = d3.axisBottom(timeScale)
                            .tickSize(-chartHeight-10)
                            .tickFormat("")
    annotations.append("g")
                .attr("class", "x axis")
                .attr("transform",`translate(${margin.left},${chartHeight + margin.top+10})`)
                .call(bottomAxis)
    annotations.append("g")
                .attr("class", "x gridlines")
                .attr("transform",`translate(${margin.left},${chartHeight + margin.top+10})`)
                .call(bottomGridlines);

    // create plot title
    annotations.append('text')
        .attr("x", chartWidth / 2.0 + margin.left)
        .attr("y", 15)
        .attr("class", "title")
        .style("font-size", "16px")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Time Series for " + clickedCoords.lat.toFixed(2).toString() + ", " + clickedCoords.lng.toFixed(2).toString());
    
    // create y-axis label
    svg.append("text")
    .attr("class", "y-axis label")
    .attr("x", -chartHeight/2.0 - 10)
    .attr("y", 10)
    .attr("transform", "rotate(-90)")
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .text(currentVariable.options[currentVariable.selectedIndex].textContent + " in " + units[currentVariable.value]);

    // create x-axis label
    svg.append('text')
        .attr("x", chartWidth / 2.0 + margin.left)
        .attr("y", chartHeight + margin.bottom + 10)
        .attr("class", "x-axis label")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Year");

    // construct line
    chartArea.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(function(d) { return (timeScale(d.time)) })
            .y(function(d) { return (dataScale(d[currentVariable.value])) })
        )
    
    // elevate plotted line above gridlines
    chartArea.raise()

    let selectedYearData = data.find(d => d.time === currentYear)[currentVariable.value]

    chartArea.append("circle")
            .attr("cx", timeScale(currentYear))
            .attr("cy", dataScale(selectedYearData))
            .attr("r", "6px")
            .style("fill", "gray")
            .style("stroke", "white")
            .style("stroke-width", 2)
}
                    
