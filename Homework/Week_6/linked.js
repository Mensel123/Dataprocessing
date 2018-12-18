window.onload = function() {
  var format = d3.format(",");

  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                if(d.properties !== undefined){
                  return "<strong>Country: </strong><span class='details'>" +
                   d.properties.name + "<br></span>" +
                   "<strong>Average Life Expectancy: </strong><span class='details'>"
                   + format(d["Average Life Expectancy"]); +"</span>";
                }
                else{
                  return "<strong>Number of years: </strong><span class='details'>" +
                   format(d)+ "<br></span>";
                }
              })

  // Queue to request both queries and wait until all requests are fulfilled
  var requests = [d3.json("world_countries.json"), d3.csv("HPI_2.csv")];

  Promise.all(requests).then(function(response) {
    var barPadding = 45;
    var top = 200;
    var right = 50;
    var bottom = 100;
    var left = 120;

    var properties = {
      width: 500 - left - right,
      height: 700 - top - bottom,
      padding: 18,
      left: left,
      right: right,
      top: top,
      bottom: bottom,

    }
    data = map(response, properties);
    draw_chart(properties);


  }).catch(function(e){
      throw(e);
  });

  function map(l, properties){
    var margin = {top: -300, right: 0, bottom: -200, left: -50},
                width = 700 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

    var color = d3.scaleThreshold()
                  .domain([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
                  .range(["rgb(247,251,255)", "rgb(222,235,247)",
                          "rgb(198,219,239)",
                          "rgb(158,202,225)", "rgb(107,174,214)",
                          "rgb(66,146,198)",
                          "rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)",
                          "rgb(3,19,43)"]);

    var path = d3.geoPath();

    var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append('g')
                .attr('class', 'map');

    var projection = d3.geoMercator()
                       .scale(130)
                       .translate( [width / 2, height / 1.5]);

    var path = d3.geoPath().projection(projection);

    svg.call(tip);

    data = l[0]
    population=l[1]
    var populationById = {};
    population.forEach(function(d) { populationById[d.Country] =
      { "Average Life Expectancy": d["Average Life Expectancy"],
      "Adjusted life expectancy": d["Inequality-adjusted Life Expectancy"],
      "Happy Life Years": d["Happy Life Years"]}});
    data.features.forEach(function(d) {
      if (populationById[d.properties.name] !== undefined){
        d["Average Life Expectancy"] =
        populationById[d.properties.name]["Average Life Expectancy"],
        d["Adjusted life expectancy"] =
        populationById[d.properties.name]["Adjusted life expectancy"],
        d["Happy Life Years"] =
        populationById[d.properties.name]["Happy Life Years"]
      }
    });


    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
          .data(data.features)
          .enter().append("path")
          .attr("d", path)
          .style("fill", function(d) {
            if (populationById[d.properties.name]
            !== undefined){
              console.log(d);
              return color(populationById[d.properties.name]
                          ["Average Life Expectancy"]); }})
          .style('stroke', 'white')
          .style('stroke-width', 1.5)
          .style("opacity",0.8)
        // tooltips
          .style("stroke","white")
          .style('stroke-width', 0.3)
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
  function draw_chart(properties){
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

    var yScale = d3.scaleLinear()
                   .domain([0,100])
                   .range([properties.height, 0]);
    var xScale = d3.scaleBand()
                   .domain(["Average Life Expectancy",
                   "Inequality-adjusted life expectancy", "Happy Life Years"])
                   .range([0, properties.width])

    var x = d3.scaleBand()
            	.rangeRound([0, properties.width])
            	.padding(0.1);
    var xAxis = d3.axisBottom()
                  .scale(xScale)
                  .ticks(4)
    var yAxis = d3.axisLeft()
                  .scale(yScale)

    // scale the datapoints to the colours
    var color = d3.scaleOrdinal()
                  .range(["#4061bd" , "#b156b7", "#ff6e54"])
                  .domain(["Average Life Expectancy",
                  "Adjusted life expectancy", "Happy Life Years"])

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

    var kleuren= Object.keys(data.Afghanistan);
    console.log(kleuren);
    rects = svg.selectAll("rect")
               .data(Object.values(data.Afghanistan))
               .enter()
               .append("rect")
               .attr("class", "bar")

               // determine x value for datapoint d
               .attr("x", function(d, i) {
                return (i * (properties.width /
                  Object.values(data.Afghanistan).length)) + properties.padding;
               })
               .attr("y", function(d) {
          	   	return yScale(0);
          	   })
               .attr("height", properties.height -yScale(0))
               .attr("width", 80)
               .style('fill', function(d, i){
                 return color(kleuren[i]); })
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
              			.data(kleuren)
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
       .attr('x', -300)
       .attr('y', -40)
       .attr('transform', 'rotate(-90)')
       .attr('text-anchor', 'middle')
       .text("Years")

  }
  function update_chart(data, properties){
    var xScale = d3.scaleBand()
                   .domain("Happy Planet Index", "Joe")
                   .range([0, properties.width])
    var yScale = d3.scaleLinear()
                   .domain([0, 100])
                   .range([properties.height, 0]);
    d3.selectAll("rect")
      .data([data["Average Life Expectancy"], data["Adjusted life expectancy"],
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
  function empty_graph(properties){
    var yScale = d3.scaleLinear()
                   .domain([0,100])
                   .range([properties.height, 0]);
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
  }
};
