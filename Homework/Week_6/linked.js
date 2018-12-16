window.onload = function() {
  var format = d3.format(",");

  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.Average_Life_Expectancy + "<br></span>" + "<strong>Happy_Planet_Index: </strong><span class='details'>" + format(d.Average_Life_Expectancy); +"</span>";
              })

  var margin = {top: 0, right: 0, bottom: -300, left: 0},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

  var color = d3.scaleThreshold()
      .domain([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

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

  // Queue to request both queries and wait until all requests are fulfilled
  var requests = [d3.json("world_countries.json"), d3.csv("HPI_2.csv")];


  Promise.all(requests).then(function(response) {

    data = map(response);
    draw_chart(data);


  }).catch(function(e){
      throw(e);
  });

  function map(l){
    data = l[0]
    population=l[1]
    var populationById = {};
    population.forEach(function(d) { populationById[d.Country] = { "Average_Life_Expectancy": d["Average Life Expectancy"], "Adjusted_life_expectancy": d["Inequality-adjusted Life Expectancy"], "Happy_Life_Years": d["Happy Life Years"]}});
    data.features.forEach(function(d) {
      if (populationById[d.properties.name] !== undefined){
        d.Average_Life_Expectancy = populationById[d.properties.name].Average_Life_Expectancy,
        d.Adjusted_life_expectancy = populationById[d.properties.name].Adjusted_life_expectancy,
        d.Happy_Life_Years = populationById[d.properties.name].Happy_Life_Years
      }
    });

    svg.append("g")
        .attr("class", "countries")
      .selectAll("path")
        .data(data.features)
      .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { if (populationById[d.properties.name] !== undefined){return color(populationById[d.properties.name].Average_Life_Expectancy); }})
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
            if (d.Average_Life_Expectancy !== undefined){
              update_chart(d)
            }
            else{
              empty_graph()
            }
          });
    return(populationById)
  }
  function draw_chart(){
    var margin = {top: 50, right: 200, bottom: 250, left: 120}
      , w = window.innerWidth - margin.left - margin.right
      , h = window.innerHeight - margin.top - margin.bottom;
    var barPadding = 45;
    /* create SVG element and within this a "g" element that contains
       multiple svg's*/
    var svg = d3.select("body")
      .append("svg")
      .attr("class", "barchart")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yScale = d3.scaleLinear()
                   .domain([0,100])
                   .range([h, 0]);
    var xScale = d3.scaleBand()
                    .domain(["Average Life Expectancy", "Inequality-adjusted life expectancy", "Happy Life Years"])
                    .range([0, w])
    // var xAxis = d3.axisBottom()
    //               .ticks(2)
    var x = d3.scaleBand()
    	.rangeRound([0, width])
    	.padding(0.1);
    var xAxis = d3.axisBottom()
                  .scale(xScale)
                  .ticks(4)
    var yAxis = d3.axisLeft()
                  .scale(yScale)

    // var cValue = function(d){
    //   return(d)
    // }

    // scale the datapoints to the colours
    var color = d3.scaleOrdinal()
      .range(["#4061bd" , "#b156b7", "#ff6e54"])
      .domain(["Average Life Expectancy", "Adjusted life expectancy", "Happy Life Years"])

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    // x_axis = data
    // x_axis_length = Object.keys(x_axis).length;
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis)
      .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-20)")
    // console.log((data.Brazil));
    // console.log(Object.values(data.Brazil));
    // console.log("000000");
    // console.log(Object.keys(data.Afghanistan));
    var kleuren= Object.keys(data.Afghanistan);
    console.log(kleuren);
    svg.selectAll("rect")
      .data(Object.values(data.Afghanistan))
      .enter()
      .append("rect")
      .attr("class", "bar")



      // determine x value for datapoint d
      .attr("x", function(d, i) {
        return (i * (w / Object.values(data.Afghanistan).length)) + barPadding;
      })

      .attr("y", function(d) {
  	   	return yScale(0);
  	   })
      .attr("height", h -yScale(0))
      .attr("width", 120)
      .style('fill', function(d, i){
        console.log(kleuren[i]);
        return color(kleuren[i]); })
      /* made legend with help of:
      Source: https://bl.ocks.org/Jverma/076377dd0125b1a508621441752735fc */

      //create legend element
      var legend = svg.selectAll('legend')
                			.data(kleuren)
                			.enter().append('g')
                			.attr('class', 'legend')
                			.attr('transform', function(d,i)
                        {
                          // console.log(color.domain());
                          return 'translate(0,' + i * 20 + ')'; });

      // add coloured rectangles after the country name to the legend
    	legend.append('rect')
      			.attr('x', w + 143)
            .attr('y', 50)
      			.attr('width', 18)
      			.attr('height', 18)
      			.style('fill', color);

    	// add names of each country to the legend
    	legend.append('text')
      			.attr('x', w + 140)
      			.attr('y', 60)
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

  }
  function update_chart(data){

    // console.log([data.Happy_Planet_Index, data.Average_Life_Expectancy, data.Adjusted_life_expectancy, data.Happy_Life_Years]);
    var margin = {top: 50, right: 100, bottom: 250, left: 120}
      , w = window.innerWidth - margin.left - margin.right
      , h = window.innerHeight - margin.top - margin.bottom;
    var barPadding = 40;
    var xScale = d3.scaleBand()
                    .domain("Happy_Planet_Index", "Joe")
                    .range([0, w])
    var yScale = d3.scaleLinear()
                   .domain([0, 100])
                   .range([h, 0]);
    d3.selectAll("rect")
      .data([data.Average_Life_Expectancy, data.Adjusted_life_expectancy, data.Happy_Life_Years])
      .transition()
      .duration(1000)
      .attr("y", function(d) {
  	   	return yScale(d);
  	   })
      .attr("height", function(d) {
          return (h - yScale(d));
      })
      // .style("fill", "black")
      // .append("rect")
      // .attr("class", "bar")
  }
  function empty_graph(){
    var margin = {top: 50, right: 200, bottom: 250, left: 120}
      , w = window.innerWidth - margin.left - margin.right
      , h = window.innerHeight - margin.top - margin.bottom;
    var barPadding = 40;
    var yScale = d3.scaleLinear()
                   .domain([0,100])
                   .range([h, 0]);
    d3.selectAll("rect")
      .data(Object.values(data.Afghanistan))
      .transition()
      .duration(1000)
      .attr("y", function() {
  	   	return h-(0);
  	   })
      .attr("height", function() {
          return (0);
      })
  }



};
