
// load csv
d3.csv("Werkmap3.csv").then(function(data) {
  console.log(data);
  // var totalProduce = [];
  // var id = [];
  });
  //
  // // iterate over data and select key and attached value
  // for(i = 0; i < data.length; i++){
  //   var value = data[i];
  //   new_amount = parseInt(value["Energieaanbod/Totaal aanbod (TPES) (PJ)"])
  //   new_name = value["Energiedragers"]
  //   totalProduce.push(new_amount)
  //   id.push(new_name);
  // }

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

  // make y and x scale function to scale datapoints
  // var yScale = d3.scaleLinear()
  //                .domain([0, d3.max(totalProduce, function(d) { return d; })])
  //                .range([h, 0]);
  // var xScale = d3.scaleBand()
  //                 .domain(id)
  //                 .range([0, w])

  // /* create SVG element and within this a "g" element that contains
  //    multiple svg's*/
  // var svg = d3.select("body")
  //   .append("svg")
  //   .attr("width", w + margin.left + margin.right)
  //   .attr("height", h + margin.top + margin.bottom)
  //   .append("g")
  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
