
  // this function draws the linegraph
  function draw(xValues, yValues, ticks, ticksConverted, totals, totalYears){
    var canvas=document.querySelector('canvas');
    var ctx=canvas.getContext('2d');
    var xStart = 50
    ctx.font = '20px arial'
    ctx.fillText("Fossil fuel emissions of the Netherlands, from 1846-2014", 25, 20)

    // this function draws the horizontal lines in the graph
    function drawYTicks(ticksConverted){
      for (i = 0; i <= ticks.length; i++){
        ctx.beginPath();
        ctx.strokeStyle = "lightgrey";
        ctx.moveTo(50,ticksConverted[i]+100);
        ctx.lineTo(450 ,ticksConverted[i]+100);
        ctx.stroke();
      }
    }

    // draw a line between all data points to create a linegraph
    for (i = 0; i < xValues.length; i++){
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.moveTo(xValues[i] + xStart,yValues[i]+100);
      ctx.lineTo(xValues[i+1] + xStart,yValues[i+1]+100);
      ctx.stroke();
    }

    // this function draws the datapoints on the y-axis and the y-label
    function drawYLabels(ticks, totals, ticksConverted){

      for (i = 0; i <= ticks.length; i++){
        ctx.font = '10px arial';
        ctx.fillText(ticks[i], 40, ticksConverted[i]+100);

      }
      ctx.font = '13px arial'
      ctx.rotate(-90 * Math.PI / 180);
      ctx.fillText('Total carbon emissions (million metric tons of C)', -450, 20)
      ctx.resetTransform();
    }

    // this function draws the datapoints on the x-axis and the x-label
    function drawXLabels(totalYears, xValues){


      for (i = 0; i <= (totalYears.length); i=i+10){
        ctx.font = '10px arial';
        ctx.rotate(-2 * Math.PI / 180);
        // ctx.textAlign = 'left';
        ctx.fillText(totalYears[i], 50 + xValues[i], 520 + i / 10 * 1);
        ctx.resetTransform();

      }

      ctx.font = '13px arial'
      ctx.fillText('Years', 225, 535)
    }
    drawYTicks(ticksConverted);
    drawYLabels(ticks, totals, ticksConverted);
    drawXLabels(totalYears, xValues);
  }


var data;
var fileName = "country.json";
var txtFile = new XMLHttpRequest();

/* this function loads a JSON file and returns the x and y values for the line
chart, source: https://data.mprog.nl/homework/javascript*/
txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {
        data = JSON.parse(txtFile.responseText);

        // extract x and y values
        var total_CO2 = Object.values(data);
        var totalYears = Object.keys(data)
        totalYears = totalYears.map(Number);

        // make array of total values
        var totals = []
        for(var key in data) {
          var value = data[key];
          totals.push(value['Total'])
        }

        // transform function to calculate x and y values
        function createTransform(domain, range){
          // domain is a two-element array of the data bounds [domain_min, domain_max]
          // range is a two-element array of the screen bounds [range_min, range_max]
          // this gives you two equations to solve:
          // range_min = alpha * domain_min + beta
          // range_max = alpha * domain_max + beta
          // a solution would be:

          var domain_min = domain[0]
          var domain_max = domain[1]
          var range_min = range[0]
          var range_max = range[1]

          // formulas to calculate the alpha and the beta
          var alpha = (range_max - range_min) / (domain_max - domain_min)
          var beta = range_max - alpha * domain_max

          // returns the function for the linear transformation (y= a * x + b)
          return function(x){
            return alpha * x + beta;


          }
        }
        // create function to transform xValues
        x_max = Math.max(...totalYears)
        x_min = Math.min(...totalYears)
        x_axis = createTransform([x_min, x_max], [0, 400])

        // create function to transform yValues
        y_max = Math.max(...totals)
        y_min = Math.min(...totals)
        y_axis = createTransform([y_min, y_max], [400, 0])

        // transform x and y-values
        xValues = [];
        for (var key in totalYears){
          var value = totalYears[key];
          xValues.push(x_axis(value));
        }

        yValues = [];
        for(var key in totals) {
          var value = totals[key];
          yValues.push(y_axis(value));
        }
        /* draw ticks from 700 - 52000
        increase of 450*/
        ticks = []
        ticksConverted = []
        tick = 0
        increase = 5500
        for (i = 0; i < 11; i++){
          ticks.push(tick)
          ticksConverted.push(y_axis(tick))
          tick = tick + increase
        }
        // draw the line chart with the transformed data
        draw(xValues, yValues, ticks, ticksConverted, totals, totalYears)
    }
}
txtFile.open("GET", fileName);
txtFile.send();
