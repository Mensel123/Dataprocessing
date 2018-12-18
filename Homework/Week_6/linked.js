// Mendel Engelaer, 10996222, Dataprocessing Linked Views

window.onload = function() {

  // add title, description and links to datasets
  d3.select("head")
    .append("title")
      .text("Scatterplot");
  d3.select("body")
    .append("p")
      .attr("class", "title")
      .text("World map showing Average Life Expectancy per country")
      .style("font-size", "45px");
  d3.select("body")
    .append("p")
      .text("Name: Mendel Engelaer, Student number: 10996222, Date: 18/12/18")
      .style("font-size", "10");
  d3.select("body")
    .append("p")
      .text("Click on country to show additional information in barchart")
      .style("font-size", "10");
  d3.select("body")
    .append("p")
      .text("Datasource: http://happyplanetindex.org")


  // function to show numbers correctly
  var format = d3.format(",");

  // create tooltip that shows info when hovering
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])

              // show country name or number of years
              .html(function(d) {
                if(d.properties !== undefined){

                  // show "Average Life Expectancy" or "No Data Available in tip"
                  if(isNaN(parseInt(format(d["Average Life Expectancy"]))) !== true){
                    return "<strong>Country: </strong><span class='details'>" +
                     d.properties.name + "<br></span>" +
                     "<strong>Average Life Expectancy: </strong><span class='details'>"
                     + format(d["Average Life Expectancy"]); +"</span>";
                  }
                  else{
                    return "<strong>Country: </strong><span class='details'>" +
                     d.properties.name + "<br></span>" +
                     "<strong>Average Life Expectancy: </strong><span class='details'>"
                     + "No Data Available" +"</span>";
                  }
                }
                else{
                  return "<strong>Number of years: </strong><span class='details'>" +
                   format(d)+ "<br></span>";
                }
              })

  // queue to request both queries and wait until all requests are fulfilled
  var requests = [d3.json("world_countries.json"), d3.csv("HPI_2.csv")];

  // if all requests are fulfilled, run code inside function
  Promise.all(requests).then(function(response) {
    var barPadding = 45;
    var top = 200;
    var right = 50;
    var bottom = 100;
    var left = 120;

    // set barchart svg properties
    var properties = {
      width: 500 - left - right,
      height: 700 - top - bottom,
      padding: 18,
      left: left,
      right: right,
      top: top,
      bottom: bottom,
    }

    // draw map and barchart
    data = map(response, properties);
    draw_chart(properties);
  }).catch(function(e){
      throw(e);
  });

  /* draw global map,
  source:http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f*/
  function map(l, properties){
    var margin = {top: -300, right: 0, bottom: -200, left: -50},
                width = 700 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

    // scale colours to increasing "Average Life Expectancy"
    var color = d3.scaleThreshold()
                  .domain([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
                  .range(["rgb(247,251,255)", "rgb(222,235,247)",
                          "rgb(198,219,239)",
                          "rgb(158,202,225)", "rgb(107,174,214)",
                          "rgb(66,146,198)",
                          "rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)",

                          "rgb(3,19,43)"]);
    // creates a svg element for every country
    var path = d3.geoPath();

    // add svg for map
    var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append('g')
                .attr('class', 'map');

    // determines angle of countries to make a horizontal or 3d-like earth
    var projection = d3.geoMercator()
                       .scale(130)
                       .translate( [width / 2, height / 1.5]);

    // create a country
    var path = d3.geoPath().projection(projection);

    // add tip to the map
    svg.call(tip);

    // select data and add them together with the countries map data
    data = l[0]
    population=l[1]
    var populationById = {};
    population.forEach(function(d) { populationById[d.Country] =
      { "Average Life Expectancy": d["Average Life Expectancy"],
      "Inequality-Adjusted Life Expectancy": d["Inequality-adjusted Life Expectancy"],
      "Happy Life Years": d["Happy Life Years"]}});
    data.features.forEach(function(d) {
      if (populationById[d.properties.name] !== undefined){
        d["Average Life Expectancy"] =
        populationById[d.properties.name]["Average Life Expectancy"],
        d["Inequality-Adjusted Life Expectancy"] =
        populationById[d.properties.name]["Inequality-Adjusted Life Expectancy"],
        d["Happy Life Years"] =
        populationById[d.properties.name]["Happy Life Years"]
      }
    });

    // create countries on map
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
          .data(data.features)
          .enter().append("path")
          .attr("d", path)

          // the higher the "Average Life Expectancy, the darker the colour"
          .style("fill", function(d) {
            if (populationById[d.properties.name]
            !== undefined){
              console.log(d);
              return color(populationById[d.properties.name]
                          ["Average Life Expectancy"]); }})
          .style('stroke', 'white')
          .style('stroke-width', 1.5)
          .style("opacity",0.8)
          .style("stroke","white")
          .style('stroke-width', 0.3)

          // on mouse hover show info
          .on('mouseover',function(d){
            tip.show(d);
            d3.select(this)
              .style("opacity", 1)
              .style("stroke","white")
              .style("stroke-width",3);
          })
          .on('mouseout', function(d){
            tip.hide(d);
            d3.select(this)
              .style("opacity", 0.8)
              .style("stroke","white")
              .style("stroke-width",0.3);
          })

          /* when clicked on country, update barchart
          when country has no data, empty barchart*/
          .on("click", function(d){
            if (d["Average Life Expectancy"] !== undefined){
              update_chart(d, properties)
            }
            else{
              empty_graph(properties)
            }
          });
    return(populationById)
  }

  // this function draws a barchart without data when the page is loaded
  function draw_chart(properties){

    // create svg
    var svg = d3.select("body")
                .append("svg")
                .attr("class", "barchart")
                .attr("width", properties.width +
                      properties.left + properties.right)
                .attr("height", properties.height +
                      properties.top + properties.bottom)
                .append("g")
                .attr("transform", "translate(" + properties.left +
                      "," + properties.top + ")");

    // make x and y scales
    var yScale = d3.scaleLinear()
                   .domain([0,100])
                   .range([properties.height, 0]);
    var xScale = d3.scaleBand()
                   .domain(["Average Life Expectancy",
                   "Inequality-Adjusted Life Expectancy", "Happy Life Years"])
                   .range([0, properties.width])

    // make axis
    var xAxis = d3.axisBottom()
                  .scale(xScale)
                  .ticks(4)
    var yAxis = d3.axisLeft()
                  .scale(yScale)



    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis);

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + properties.height + ")")
       .call(xAxis)
       .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-20)")

    // set bar colours
    var color = d3.scaleOrdinal()
                  .range(["#4061bd" , "#b156b7", "#ff6e54"])
                  .domain(["Average Life Expectancy",
                  "Inequality-Adjusted Life Expectancy", "Happy Life Years"])

    var colors= Object.keys(data.Afghanistan);

    // create bars
    rects = svg.selectAll("rect")
               .data(Object.values(data.Afghanistan))
               .enter()
               .append("rect")
               .attr("class", "bar")

               // determine x and y value for bar d
               .attr("x", function(d, i) {
                return (i * (properties.width /
                  Object.values(data.Afghanistan).length)) + properties.padding;
               })
               .attr("y", function(d) {
          	   	return yScale(0);
          	   })

               // determine height, width and color
               .attr("height", properties.height -yScale(0))
               .attr("width", 80)
               .style('fill', function(d, i){
                 return color(colors[i]); })

               // show tip when mouse hovers over bar
               .on('mouseover',function(d){
                 tip.show(d);
                d3.select(this)
                  .style("opacity", 0.6)
                  .style("stroke","white")
                  .style("stroke-width",3);
                })
               .on('mouseout', function(d){
                 tip.hide(d);
                 d3.select(this)
                   .style("opacity", 1)
                   .style("stroke","white")
                   .style("stroke-width",0.3);
                 })

    /* made legend with help of:
    Source: https://bl.ocks.org/Jverma/076377dd0125b1a508621441752735fc */

    //create legend element
    var legend = svg.selectAll('legend')
              			.data(colors)
              			.enter().append('g')
              			.attr('class', 'legend')
              			.attr('transform', function(d,i)
                      {
                        return 'translate(0,' + i * 20 + ')';
                      });

    // add coloured rectangles after the country name to the legend
  	legend.append('rect')
    			.attr('x', properties.width + 35)
          .attr('y', -72)
    			.attr('width', 18)
    			.attr('height', 18)
    			.style('fill', color);

  	// add names of each country to the legend
  	legend.append('text')
    			.attr('x', properties.width + 30)
    			.attr('y', -65)
    			.attr('dy', '.35em')
    			.style('text-anchor', 'end')
    			.text(function(d){ return d; });

    // add y-label
    svg.append('text')
       .attr("class", "yLabel")
       .attr('x', -200)
       .attr('y', -40)
       .attr('transform', 'rotate(-90)')
       .attr('text-anchor', 'middle')
       .text("Years")

    // add error message when no data is available
    svg.append('text')
      .style("opacity", 0)
      .attr("class", "error_message")
      .attr('x', 200)
      .attr('y', 150)
      .attr('text-anchor', 'middle')
      .text("No Data Available")

  }

  // this function updates the bar graph
  function update_chart(data, properties){

    // remove error message
    d3.select(".error_message")
      .transition()
      .duration(500)
      .style("opacity", 0)

    // make new scale for new data
    var xScale = d3.scaleBand()
                   .domain("Happy Planet Index", "Joe")
                   .range([0, properties.width])
    var yScale = d3.scaleLinear()
                   .domain([0, 100])
                   .range([properties.height, 0]);

    // select bars and update with new data
    d3.selectAll("rect")
      .data([data["Average Life Expectancy"], data["Inequality-Adjusted Life Expectancy"],
        data["Happy Life Years"]])
      .transition()
      .duration(1000)
      .attr("y", function(d) {
  	   	return yScale(d);
  	   })
      .attr("height", function(d) {
          return (properties.height - yScale(d));
      })
  }

  // this functions emptys graph when no data is available for that country
  function empty_graph(properties){
    var yScale = d3.scaleLinear()
                   .domain([0,100])
                   .range([properties.height, 0]);

    // select bars en set them to zero
    d3.selectAll("rect")
      .data(Object.values(data.Afghanistan))
      .transition()
      .duration(1000)
      .attr("y", function() {
  	   	return properties.height-(0);
  	   })
      .attr("height", function() {
          return (0);
      })

    // show error message in bargraph
    d3.select(".barchart").select("g").select(".error_message")
      .transition()
      .duration(700)
      .style("opacity", 1)
  }
};
