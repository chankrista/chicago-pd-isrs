import { select, selectAll } from "d3-selection";
import { geoAlbers, geoPath } from "d3-geo";
import { groupBy } from "./utils";
import { scaleThreshold, scaleLinear } from "d3-scale";
import { extent, quantile } from "d3-array";
import { schemeBlues, schemeOranges } from "d3-scale-chromatic";
import { bodyCamera } from "./body-camera.js";
import summaryStats from "./summary-stats.js";
import lineChart from "./line-chart";


export default function districtMap(data, crimes, districts, isrs) {

  //add a time frame filter here once that's figured out.
  if (isrs) {
    var dist_data = groupBy(data, "DISTRICT");
  } else {
    var dist_data = groupBy(crimes, "district");
  }

  // Width and Height of the whole visualization
  var width = 500;
  var height = 540;
  document.getElementById(isrs ? "map-isrs" : "map-crimes").innerHTML = "";
  var svg = select(isrs ? "#map-isrs" : "#map-crimes")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Append empty placeholder g element to the SVG
  // g will contain geometry elements
  var g = svg.append("g");

  var albersProjection = geoAlbers()
    .scale(70000)
    .rotate([87.7516, 0])
    .center([0, 41.8389])
    .translate([width / 2, height / 2]);

  var path_fn = geoPath().projection(albersProjection);

  const color_scheme = isrs ? schemeBlues[9] : schemeOranges[9];

  var color_min = Math.min(...dist_data.map(d => d.y));
  var color_max = Math.max(...dist_data.map(d => d.y));

  var color = scaleLinear()
    .domain([color_min, color_max])
    .range([color_scheme[0], color_scheme[color_scheme.length - 1]]);

  g.selectAll("path")
    .data(districts.features)
    .enter()
    .append("path")
    .attr("fill", function (d) {
      return color(
        dist_data.map(r => r.x).includes(d.properties.dist_num) ?
          dist_data.filter(row => row.x == d.properties.dist_num)[0].y :
          0
      );
    })
    .attr("stroke", "#333")
    .attr("d", path_fn)
    .attr("stroke-opacity", 0.5)
    .attr("stroke-width", 1)
    .attr("class", d => d.properties.dist_label)
    .on("click", function (d) {
      var all_dates = new Set(data.map(row => row.month_year))
      if (all_dates.size == 1){
        alert("Time and district filters cannot both be applied. Page must reload!");
        location.reload()
      } else {
        selectAll("path")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-width", 1);
        var paths = document.getElementsByClassName(d.properties.dist_label);
        paths[0].setAttribute("stroke-opacity", 1);
        paths[0].setAttribute("stroke-width", 3);
        paths[1].setAttribute("stroke-opacity", 1);
        paths[1].setAttribute("stroke-width", 3);
        document.getElementById("body-cameras").innerHTML = "";
        summaryStats(d.properties.dist_num, data, crimes, data[0].month_year === data.slice(-1)[0].month_year ? data[0].month_year : "2016-2018");
        var dist_data = data.filter(row => row.DISTRICT === d.properties.dist_num);
        lineChart(dist_data, crimes, districts);
      }
    });

  var increment = (color_max - color_min) / 9;
  var current_val = color_min;
  var y_legend = 300;
  for (let i = 0; i < color_scheme.length; i++) {
    svg.append("rect")
      .attr("fill", color_scheme[i])
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", 70)
      .attr("y", y_legend)

    svg.append("text")
      .text("<" + current_val.toFixed(0))
      .attr("x", 85)
      .attr("y", y_legend + 10)
      .attr("font-size", "8px")

    current_val += increment;
    y_legend += 15;
  }



  // svg.append("g")
  //   .attr("class", "legendLinear")
  //   .attr("transform", "translate(20,20)");  

  // var legendLinear = legendColor()
  //   .shapeWidth(30)
  //   .orient('horizontal')
  //   .scale(color);

  // svg.select(".legendLinear")
  //   .call(legendLinear);
}
