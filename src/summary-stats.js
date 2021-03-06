import { select } from "d3-selection";
import { groupBy } from "./utils";
import { schemeDark2 } from "d3-scale-chromatic";
import { pie, arc } from "d3-shape";
import { scaleOrdinal } from "d3-scale";
import { timeParse, timeFormat } from "d3-time-format";

export default function summaryStats(dist, isrs, crimes, time = "2016-2018") {

  if (time === "2016-2018") {
    var time_clean = time;
  } else {
    var date_parse = timeParse("%m/%d/%Y")
    var format = timeFormat("%b %Y")
    var time_clean = format(date_parse(time));
  }
  var time_data = isrs;
  var time_crimes_data = crimes;


  var time_isrs = groupBy(time_data, "year")[0].y;
  var time_crimes = groupBy(time_crimes_data, "year")[0].y;

  if (dist === 0) {
    var dist_isrs = time_isrs;
    var dist_crimes_data = time_crimes_data;
    var dist_crimes = time_crimes;
    var dist_name = "the city of Chicago";
    var dist_time_data = time_data
  } else {
    var dist_time_data = time_data.filter(row => row.DISTRICT === dist);
    var dist_isrs = groupBy(dist_time_data, "DISTRICT")[0].y;
    var dist_crimes_data = time_crimes_data.filter(row => row.district == dist);
    var dist_crimes = groupBy(dist_crimes_data, "district")[0].y;
    var dist_name = "district " + dist;

  }
  var dist_grouped = groupBy(dist_time_data, "BODY_CAMERA_I");
  var dist_grouped = [dist_grouped[1], dist_grouped[0]];

  document.getElementById("summary_isrs").innerHTML = "";
  document.getElementById("summary_crimes").innerHTML = "";
  select("#summary_isrs").html(
    "<p>In " + time_clean + ", there were <b>" +
    dist_isrs +
    " ISRs</b> in " +
    dist_name +
    ",<br>which is <b>" +
    Math.round((dist_isrs / time_isrs) * 100) +
    "%</b> of the citywide total.</p>"
  );
  select("#summary_crimes").html(
    "<p>In " + time_clean + ", there were <b>" +
    dist_crimes +
    " crimes</b> in district " +
    dist +
    ",<br>which is <b>" +
    Math.round((dist_crimes / time_crimes) * 100) +
    "%</b> of the citywide total.</p>"
  );



  var height = 180;
  var width = 180;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var w = width - margin.left - margin.right;
  var h = height - margin.top - margin.bottom;

  var outerRadius = w / 2;
  var innerRadius = w / 3;
  var arc_func = arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  var pie_func = pie();
  var color = scaleOrdinal(schemeDark2);
  var recorded = (typeof dist_grouped[0] == 'undefined' ? 0 : dist_grouped[0].y);
  var pct_recorded = ((recorded / (recorded + dist_grouped[1].y)) * 100).toFixed(2)

  document.getElementById("body-cameras").innerHTML = `<h3>Body Camera Use</h3>
    <h5>` + pct_recorded + `% of ISRs were recorded by a body camera in ` + dist_name + `.</h5>
    <table>
      <tr>
        <td>
          <svg width="10" height="20">
            <rect width="10" height="10" style="fill:` + schemeDark2[0] + `;" />
          </svg>
        </td>
        <td>
          Yes
        </td>        
      </tr>
      <tr>
        <td>
          <svg width="10" height="20">
            <rect width="10" height="10" style="fill:` + schemeDark2[1] + `;" />
          </svg>
        </td>
        <td>
          No
        </td>        
      </tr> 
    </table>`

  //Create SVG element
  var svg = select("#body-cameras")
    .append("svg")
    .attr("width", w)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Set up groups
  var arcs = svg.selectAll("g.arc")
    .data(pie_func(dist_grouped.map(function (d) {
      return (typeof d == "undefined" ? 0 : d.y)
    })))
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
