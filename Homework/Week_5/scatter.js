// Mendel Engelaer 10996222

// this function makes a d3 scatterplot
window.onload = function() {

  // add title, description and links to datasets
  d3.select("head")
    .append("title")
      .text("Scatterplot");
  d3.select("body")
    .append("p")
      .attr("class", "title")
      .text("Scatterplot showing amount of researchers that are women vs consumer confidence");
  d3.select("body")
    .append("p")
      .text("Name: Mendel Engelaer, Student number: 10996222, Date: 5/12/18")
      .style("height", "40");
  d3.select("body").append("a")
    .attr("href", "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015")
    .text("Link to Dataset1")
    .attr("class", "button")
  d3.select("body")
    .append("a")
      .attr("href", "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015")
      .text("Link to Dataset2")
      .attr("class", "button")

  var top = 50;
  var right = 0;
  var bottom = 70;
  var left = 70;

  var properties = {
    width: 650 - left - right,
    height: 500 - top - bottom,
    padding: 150,
    left: left,
    right: right,
    top: top,
    bottom: bottom,

  }

  // make svg element
  var svg = d3.select("body")
    .append("svg")
    .attr("width", properties.width)
    .attr("height", properties.height)
    .append("g")


  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015";
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015";
  var requests = [d3.json(womenInScience), d3.json(consConf)];

  /* this function waits until the datasets are loaded and then it executes the
  response*/
  Promise.all(requests, properties).then(function(response) {

    /* transform dataset1 and dataset2
    edited from: https://data.mprog.nl/course/10%20Homework/100%20D3%20Scatterplot/scripts/transformResponseV1.js */
    dataset1 = transformResponse(response[0]);
    dataset2 = transformResponse(response[1]);

    // start with a graph of 2007
    year = "2007";

    // combine two datasets into list and draw the graph
    list = combineData(dataset1, dataset2, year);
    drawGraph(list);
    slider(dataset1, dataset2);

  // catch error
  }).catch(function(e){
      throw(e);
  })

  // this function selects the stored data from requested year
  function selectData(dataset, year){
    let tempDict = []
    dataset.forEach(function(element){
      if (element["time"] === year){
        tempDict.push([
          element["Country"],
          element["datapoint"]
        ]);
      };
    });
    return tempDict
  }

  // merge the 2 datasets in list of objects, with name, x and y value
  function combineData(dataset1, dataset2, year){
    tempDict = selectData(dataset1, year).sort()
    tempDict2 = selectData(dataset2, year).sort()
    var list = []
    for (var i = 0; i < tempDict.length; i++){
      var dict = {}
      dict.name = tempDict[i][0]
      dict.x = tempDict[i][1]
      dict.y = tempDict2[i][1]
      list.push(dict)
    }
    return(list)
  };

  // this function draws the graph when the page is loaded
  function drawGraph(tempDict, tempDict2){

    // calculate de min and max of the x and y values
    var maxX = Math.max.apply(Math, list.map(function(o) { return o.x; }));
    var minX = Math.min.apply(Math, list.map(function(o) { return o.x; }));
    var maxY = Math.max.apply(Math, list.map(function(o) { return o.y; }));
    var minY = Math.min.apply(Math, list.map(function(o) { return o.y; }));

    // scale functions to scale data to svg
    var xScale = d3.scaleLinear()
      .domain([minX, maxX]).nice()
      .range([properties.left, properties.width - properties.right - properties.padding])
    var yScale = d3.scaleLinear()
     .domain([minY, maxY]).nice()
     .range([properties.height - properties.bottom, properties.top]);

    /* Define the div for the tooltip
    source: http://bl.ocks.org/d3noob/a22c42db65eb00d4e369*/
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    /* function returns the name of each datapoint
    source: http://dataforradicals.com/2017/03/20/the-absurdly-illustrated-guide-to-your-first-d3-scatterplot/ */
    var cValue = function(d){
      return(d.name)
    }

    // scale the datapoints to the colours
    var color = d3.scaleOrdinal()
      .range(d3.schemeCategory10)
      .domain(["France", "Germany", "Korea", "Netherlands", "Portugal", "United Kingdom"])

    // create circles for each datapoint
    d3.select("svg").selectAll("circle")
      .data(list)
      .enter()
      .append("circle")
        .attr("class", "circle")
        .attr("cx", function(d) {
          return xScale(d['x']);
         })
        .attr("cy", function(d) {
          return yScale(d['y']);
         })
        .attr("r", 5)

        // add smooth transition
        .transition()
        .duration(200)
        .style('fill', function(d){ return color(cValue(d)); })

    // when mouse hovers over datapoint, show x and y values
    d3.selectAll("circle")
      .on("mouseover", function(d) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div	.html("x: " + d['x'].toFixed(2) + "<br/>" + "y: " + d['y'])
            .style("left", (d3.event.pageX) + 5 + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          div.transition()
              .duration(300)
              .style("opacity", 0);
        });

    // add y axis
    svg.append("g")
       .attr("class", "y axis")
       .attr("transform", `translate(${properties.left},0)`)
       .call(d3.axisLeft(yScale));

    // add x axis
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", `translate(0,${properties.height - properties.bottom})`)
       .call(d3.axisBottom(xScale));

    // add title
    svg.append('text')
       .attr("class", "plotTitle")
       .attr('x', 300)
       .attr('y', 35)
       .attr('text-anchor', 'middle')
       .text("Consumer confidence vs amount of women researches (%)")

    // add x-label
    svg.append('text')
       .attr("class", "xLabel")
       .attr('x', 250)
       .attr('y', 350)
       .attr('text-anchor', 'middle')
       .text("Amount of women researches (%)")

    // add y-label
    svg.append('text')
       .attr("class", "yLabel")
       .attr('x', -160)
       .attr('y', 25)
       .attr('transform', 'rotate(-90)')
       .attr('text-anchor', 'middle')
       .text("Consumer confidence")

    /* made legend with help of:
    Source: https://bl.ocks.org/Jverma/076377dd0125b1a508621441752735fc */

    //create legend element
    var legend = svg.selectAll('legend')
              			.data(color.domain())
              			.enter().append('g')
              			.attr('class', 'legend')
              			.attr('transform', function(d,i)
                      { return 'translate(0,' + i * 20 + ')'; });

    // add coloured rectangles after the country name to the legend
		legend.append('rect')
    			.attr('x', properties.width - 20)
          .attr('y', 50)
    			.attr('width', 18)
    			.attr('height', 18)
    			.style('fill', color);

		// add names of each country to the legend
		legend.append('text')
    			.attr('x', properties.width - 26)
    			.attr('y', 60)
    			.attr('dy', '.35em')
    			.style('text-anchor', 'end')
    			.text(function(d){ return d; });
  };

  // add slidebar
  d3.select("body").append("div")
    .attr("class", "slidecontainer")
    .append("input")
      .attr("type", "range")
      .attr("min", "2007")
      .attr("max", "2015")
      .attr("value", "2007")
      .attr("class", "slider")
      .attr("id", "myRange")

  // add 'p' element to show the current year of the slidebar
  d3.select("div").append("p")
                  .text("Year:")
                  .append("span")
                    .attr("id", "demo")
                    .style("font-weight","bold")

  // updates the graph when slider is moved
  function updateGraph(list){

    // calculate de min and max of the x and y values
    var maxX = Math.max.apply(Math, list.map(function(o) { return o.x; }));
    var minX = Math.min.apply(Math, list.map(function(o) { return o.x; }));
    var maxY = Math.max.apply(Math, list.map(function(o) { return o.y; }));
    var minY = Math.min.apply(Math, list.map(function(o) { return o.y; }));

    // scale functions to scale data to svg
    var xScale = d3.scaleLinear()
                   .domain([minX, maxX]).nice()
                   .range([properties.left, properties.width - properties.right
                    - properties.padding])
    var yScale = d3.scaleLinear()
                   .domain([minY, maxY]).nice()
                   .range([properties.height - properties.bottom, properties.top]);

    /* function returns the name of each datapoint
    source: http://dataforradicals.com/2017/03/20/the-absurdly-illustrated-guide-to-your-first-d3-scatterplot/ */
    var cValue = function(d){
      return(d.name)
    }

    // scale the datapoints to the colours
    var color = d3.scaleOrdinal()
                  .domain(["France", "Germany", "Korea", "Netherlands", "Portugal", "United Kingdom"])
                  .range(d3.schemeCategory10)

    // remove all datapoints
    let changed = d3.select("svg").selectAll("circle")
                    .remove()

    /* Define the div for the tooltip
    source: http://bl.ocks.org/d3noob/a22c42db65eb00d4e369*/
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // add new datapoints
    d3.select("svg").selectAll("circle")
      .data(list)
      .enter()
      .append("circle")
        .attr("class", "circle")
        .attr("cx", function(d) {
          return xScale(d['x']);
         })
        .attr("cy", function(d) {
          return yScale(d['y']);
         })
        .attr("r", 5)

        // add smooth transition
        .transition()
        .duration(200)
        .style('fill', function(d){ return color(cValue(d)); })

    // when mouse hovers over datapoint, show x and y values
    d3.selectAll("circle")
      .on("mouseover", function(d) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div	.html("x: " + d['x'].toFixed(2) + "<br/>" + "y: " + d['y'])
            .style("left", (d3.event.pageX) + 5 + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          div.transition()
              .duration(300)
              .style("opacity", 0);
        });


    // Update X Axis
    svg.select(".x.axis")
       .transition()
       .duration(1000)
       .call(d3.axisBottom(xScale));

    // Update Y Axis
    svg.select(".y.axis")
       .transition()
       .duration(1000)
       .call(d3.axisLeft(yScale));
  }

  /* this function adds functionality to the sliderbar
  source: https://www.w3schools.com/howto/howto_js_rangeslider.asp */
  function slider(dataset1, dataset2){

    // get slider and output element
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");

    /* output element shows the current value (2007) of the slider when page is
    loaded */
    output.innerHTML = slider.value;

    /* when slider is moved, update value shown beneath slidebar, update graph
    with data of required year*/
    slider.oninput = function() {
      output.innerHTML = this.value;
      list = combineData(dataset1, dataset2, output.innerHTML)
      updateGraph(list)
    }
  }
};
