import { select } from "d3-selection";
import { groupBy } from "./utils";
import { schemeDark2 } from "d3-scale-chromatic";
import { pie, arc } from "d3-shape";
import { scaleOrdinal } from "d3-scale";

export default function summaryStats(dist, isrs, crimes, dist_geo) {

  var time_data = isrs.filter(row => row.year === "2018");
  var time_isrs = groupBy(time_data, "year")[0].y;

  var time_crimes_data = crimes.filter(row => row.year === "2018");
  var time_crimes = groupBy(time_crimes_data, "year")[0].y;

  var dist_isrs = groupBy(time_data, "DISTRICT")[0].y;
  var dist_crimes_data = time_crimes_data.filter(row => row.district == dist);
  var dist_crimes = groupBy(dist_crimes_data, "district")[0].y;

  select("#summary_isrs").html(
    "<p>In 2018, there were <b>" +
    dist_isrs +
    " ISRs</b> in district " +
    dist +
    ",<br>which is <b>" +
    Math.round((dist_isrs / time_isrs) * 100) +
    "%</b> of the citywide total.</p>"
  );
  select("#summary_crimes").html(
    "<p>In 2018, there were <b>" +
    dist_crimes +
    " crimes</b> in district " +
    dist +
    ",<br>which is <b>" +
    Math.round((dist_crimes / time_crimes) * 100) +
    "%</b> of the citywide total.</p>"
  );

  var dist_time_data = time_data.filter(row => row.DISTRICT === dist && row.year === "2018");
  console.log(dist_time_data);
  var dist_grouped = groupBy(dist_time_data, "BODY_CAMERA_I");
  console.log(dist_grouped);

  var w = 300;
  var h = 300;

  var outerRadius = w / 2;
  var innerRadius = w / 3;
  var arc_func = arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  var pie_func = pie();

  //Easy colors accessible via a 10-step ordinal scale
  var color = scaleOrdinal(schemeDark2);
  
  document.getElementById("body-cameras").innerHTML = "<h3>Body Camera Use</h3><h5>Proportion of stops recorded by a body camera.</h5>"
  //Create SVG element
  var svg = select("#body-cameras")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  //Set up groups
  var arcs = svg.selectAll("g.arc")
    .data(pie_func(dist_grouped.map(d => d.y)))
    .enter()
    .append("g")
    .attr("class", "arc")
    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

  //Draw arc paths
  arcs.append("path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", arc_func);

  //Labels
  arcs.append("text")
    .attr("transform", function (d) {
      return "translate(" + arc_func.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.value;
    });

}
