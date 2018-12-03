// Mendel Engelaer 10996222
// import transformResponse from 'transform';


window.onload = function() {
  d3.select("head").append("title").text("Scatterplot");
  d3.select("body").append("p").attr("class", "title").text("Scatterplot showing amount of researchers that are women vs consumer confidence");
  d3.select("body").append("p").text("Mendel Engelaer, 10996222").style("height", "40");
  d3.select("body").append("a").attr("href", "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015").text("Dataset1")
  d3.select("body").append("a").attr("href", "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015").text("Dataset2")

  // d3.select("body").append("p").text("Deze staafgrafiek laat de energieproductie van verschillende bronnen zien van 2017");
  var margin = {top: 50, right: 0, bottom: 70, left: 70}
    , w = 650 - margin.left - margin.right
    , h = 500 - margin.top - margin.bottom;
  var margins = {
    width: w,
    height: h,
    padding: 150,
    left: margin.left,
    right: margin.right,
    top: margin.top,
    bottom: margin.bottom
  }

  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)// + margin.left + margin.right)
    .attr("height", h)// + margin.top + margin.bottom)
    .append("g")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

  var requests = [d3.json(womenInScience), d3.json(consConf)];

  Promise.all(requests, margins).then(function(response) {
        dataset1 = transformResponse(response[0]);
        dataset2 = transformResponse(response[1]);
        console.log(dataset2);
        year = "2007"
        list = combineData(dataset1, dataset2, year)
        console.log(list);
        drawGraph(list)
        slider(dataset1, dataset2)


  }).catch(function(e){
      throw(e);
  })

  function selectData(dataset, year){
    let tempDict = []
    dataset.forEach(function(element){
      // console.log(element["time"]);
      if (element["time"] === year){
      tempDict.push([
        element["Country"],
        element["datapoint"]
      ]);
      }
    });
    return tempDict
  }
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

  function drawGraph(tempDict, tempDict2){
    var maxX = Math.max.apply(Math, list.map(function(o) { return o.x; }));
    var minX = Math.min.apply(Math, list.map(function(o) { return o.x; }));
    var maxY = Math.max.apply(Math, list.map(function(o) { return o.y; }));
    var minY = Math.min.apply(Math, list.map(function(o) { return o.y; }));

    var xScale = d3.scaleLinear()
      .domain([minX, maxX]).nice()
      .range([margins.left, margins.width - margins.right - margins.padding])
    var yScale = d3.scaleLinear()
     .domain([minY, maxY]).nice()
     .range([margins.height - margins.bottom, margins.top]);

    var tooltip = d3.select("body").append("div")
      .attr("class", "toolTip");
     // setup fill color
    var cValue = function(d){
      return(d.name)
    }

    var color = d3.scaleOrdinal()
      .range(d3.schemeCategory10)
      .domain(["France", "Germany", "Korea", "Netherlands", "Portugal", "United Kingdom"])
    // console.log(colors);
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
      .style('fill', function(d){ return color(cValue(d)); })
      // .style("fill", function(d) { return colors(d); })
      .on("mousemove", function(d){
        tooltip
          .style("left", (d3.event.pageX - 30) + "px")
          .style("top", (d3.event.pageY - 55) + "px")
          .style("display", "inline-block")
          .html([d['x']]);
        })
      // show nothing when mouse doesnt hover over bar
      .on("mouseout", function(d){ tooltip.style("display", "none");});

    svg.append("g")
       .attr("class", "y axis")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(yScale));


    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", `translate(0,${margins.height - margins.bottom})`)
       .call(d3.axisBottom(xScale));

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



    // made legend with help of:
    // Source: https://bl.ocks.org/Jverma/076377dd0125b1a508621441752735fc
    var legend = svg.selectAll('legend')
              			.data(color.domain())
              			.enter().append('g')
              			.attr('class', 'legend')
              			.attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });

		// give x value equal to the legend elements.
		// no need to define a function for fill, this is automatically fill by color.
		legend.append('rect')
    			.attr('x', margins.width - 20)
    			.attr('width', 18)
    			.attr('height', 18)
    			.style('fill', color);

		// add text to the legend elements.
		// rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
		legend.append('text')
    			.attr('x', margins.width - 26)
    			.attr('y', 9)
    			.attr('dy', '.35em')
    			.style('text-anchor', 'end')
    			.text(function(d){ return d; });
  };
  d3.select("body").append("div")
    .attr("class", "slidecontainer")
    .append("input")
      .attr("type", "range")
      .attr("min", "2007")
      .attr("max", "2015")
      .attr("value", "2007")
      .attr("class", "slider")
      .attr("id", "myRange")

  d3.select("div").append("p")
                  .text("Year:")
                  .append("span")
                    .attr("id", "demo")
                    .style("font-weight","bold")

  function updateGraph(list){
    var maxX = Math.max.apply(Math, list.map(function(o) { return o.x; }));
    var minX = Math.min.apply(Math, list.map(function(o) { return o.x; }));
    var maxY = Math.max.apply(Math, list.map(function(o) { return o.y; }));
    var minY = Math.min.apply(Math, list.map(function(o) { return o.y; }));

    var xScale = d3.scaleLinear()
                   .domain([minX, maxX]).nice()
                   .range([margins.left, margins.width - margins.right - margins.padding])
    var yScale = d3.scaleLinear()
                   .domain([minY, maxY]).nice()
                   .range([margins.height - margins.bottom, margins.top]);

    // setup fill color
    var cValue = function(d){
      return(d.name)
    }


    var color = d3.scaleOrdinal()
                  .domain(["France", "Germany", "Korea", "Netherlands", "Portugal", "United Kingdom"])
                  .range(d3.schemeCategory10)

    let changed = d3.select("svg").selectAll("circle")

                    .remove()  // Update with new data

    // changed.transition()  // Transition from old to new
    //        .attr("cx", function(d) {
    //           return xScale(d['x']);  // Circle's X
    //        })
    //        .attr("cy", function(d) {
    //         return yScale(d['y']);  // Circle's Y
    //        })
    // changed.transition().style("opacity", 0).remove()
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
      .style('fill', function(d){ return color(cValue(d)); })


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

  function slider(dataset1, dataset2){
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    output.innerHTML = slider.value;

    slider.oninput = function() {
      output.innerHTML = this.value;
      list = combineData(dataset1, dataset2, output.innerHTML)
      console.log(list);
      updateGraph(list)
      // drawGraph(list)
    }
  }



};

/*

- explain colors
*/
