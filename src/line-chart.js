import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { extent, max, min } from "d3-array";
import { line, curveMonotoneX } from "d3-shape";
import { groupBy } from "./utils";
import { timeFormat, timeParse } from "d3-time-format";

export default function lineChart(d) {
  var height = 300;
  var width = 800;
  var margin = { top: 20, right: 15, bottom: 25, left: 25 };
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;
  var svg = select("#line-graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var groups = {};
  for (let i = 0; i < d.length; i++) {
    var current_val = parseInt(d[i].count);
    var month_year = d[i]["month_year"];

    if (Object.keys(groups).includes(month_year.toString())) {
      groups[month_year] += current_val;
    } else {
      groups[month_year] = current_val;
    }
  }

  // const groups = d.reduce((acc, row) => {
  //   var current_val = parseInt(row["counts"]);
  //   if (acc[row["month_year"]]) {
  //     acc[row["month_year"]] = acc[row["month_year"]] + current_val;
  //   } else {
  //     acc[row["month_year"]] = current_val;
  //   }
  //   return acc;
  // });

  var parseTime = timeParse("%Y-%m-%d");
  var data = Object.entries(groups);
  var data = data.map(row => [parseTime(row[0]), row[1]]);
  //var data = groupBy(d, "month_year");
  var x = scaleTime()
    .domain(extent(data, d => d[0]))
    .range([0, width]);
  console.log("x", x);
  svg
    .append("g")
    .attr("transform", "translate(0, " + height + ")")
    .call(axisBottom(x));
  console.log("domain", [0, max(data.map(d => d[1]))]);
  var y = scaleLinear()
    .domain([0, max(data.map(d => d[1]))])
    .range([height, 0]);
  svg.append("g").call(axisLeft(y));

  const lineScale = line()
    .x(d => {
      return x(d);
    })
    .y(d => {
      return y(d);
    });
  console.log("data here", data);
  svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("fill", "steelblue")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", lineScale);

  // var d_time = d.map(function(row){
  //     return {time_frame: row.CONTACT_DATE.getFullYear()};
  // });
  // var data = groupBy(d_time, "time_frame");
  // data.sort(function(a,b){
  //     return b.time_frame - a.time_frame;
  // });

  // // set the ranges
  // var x = scaleLinear().range([0, width]);
  // x.domain(extent(data, d => d.time_frame));

  // var y = scaleLinear().range([height, 0]);
  // y.domain(0, max(data, d => d.value));

  // var valueline = line()
  //     .x(d => d.time_frame)
  //     .y(d => d.value);

  // var xAxis_woy = axisBottom(x).ticks(11).tickValues(data.map(d=>d.time_frame));

  // svg.append("path")
  //     .data([data])
  //     .attr("class", "line")
  //     .attr("d", valueline);

  // svg.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis_woy);

  // svg.selectAll(".dot")
  //     .data(data)
  //     .enter()
  //     .append("circle") // Uses the enter().append() method
  //     .attr("class", "dot") // Assign a class for stylingCONTAC
  //     .attr("cx", d => d.time_frame)
  //     .attr("cy", d => d.value)
  //     .attr("r", 5);

  // svg.selectAll(".text")
  //     .data(data)
  //     .enter()
  //     .append("text") // Uses the enter().append() method
  //     .attr("class", "label") // Assign a class for styling
  //     .attr("x", d => d.time_frame)
  //     .attr("y", d => d.value)
  //     .attr("dy", "-5")
  //     .text(function(d) {return d.value; });
}
