import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { extent, max, min } from "d3-array";
import { line, curveMonotoneX } from "d3-shape";
import { groupBy } from "./utils";
import { timeFormat, timeParse } from "d3-time-format";
import districtMap from "./district-map";
import summaryStats from "./summary-stats";

export default function lineChart(data_full, c, districts) {

  var height = 200;
  var width = 600;
  var margin = { top: 20, right: 15, bottom: 50, left: 25 };
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;
  document.getElementById("line-graph").innerHTML = "";
  var svg = select("#line-graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var data = groupBy(data_full, "month_year");
  var parseTime = timeParse("%m/%d/%Y");
  var data = data
    .map(d => ({ x: parseTime(d.x), y: d.y }))
    .sort((a, b) => {
      return a.x - b.x;
    });

  var x = scaleTime()
    .domain(extent(data, d => d.x))
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0, " + height + ")")
    .call(axisBottom(x));
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .attr("class", "axis-label")
    .text("Month of ISR");

  var y = scaleLinear()
    .domain([0, max(data.map(d => d.y))])
    .range([height, 0]);
  svg.append("g").call(axisLeft(y));

  const lineScale = line()
    .x(d => x(d.x))
    .y(d => y(d.y));

  svg
    .selectAll("path")
    .data([data], d => d)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d => {
      return lineScale(d);
    });

  for (let i = 0; i < data.length; i++) {
    svg
      .selectAll(".circle")
      .data([data], d => d)
      .enter()
      .append("circle")
      .attr("class", d => d[i].x)
      .attr("r", "5")
      .attr("cx", d => x(d[i].x))
      .attr("cy", d => y(d[i].y))
      .attr("fill", "steelblue")
      .on("click", function (row) {
        var circles = document.getElementsByTagName("circle");
        for (let i = 0; i < circles.length; i++) {
          circles[i].setAttribute("stroke", "");
          circles[i].setAttribute("stroke-width", 0);
        }
        var circle = document.getElementsByClassName(row[i].x)[0];
        circle.setAttribute("stroke", "gray");
        circle.setAttribute("stroke-width", 3);

        // .attr("stroke", "gray")
        // .attr("stroke-width", 3)
        var crimeParse = timeParse("%Y-%m");
        var crime_data = c.filter(a => String(crimeParse(a.month_year)) === String(row[i].x));
        var time_data = data_full.filter(a => String(parseTime(a.month_year)) === String(row[i].x));
        var dists = new Set(time_data.map(r => r.DISTRICT));
        var dates = new Set(time_data.map(r => r.month_year));
        var date_true = dates.size == 1;
        var dist_true = dists.size == 1;
        if (date_true && dist_true) {
          alert("Time and district filters cannot both be applied. Page must reload!")
          location.reload();
        } else {
          districtMap(time_data, crime_data, districts, true);
          districtMap(time_data, crime_data, districts, false);
          summaryStats(0, time_data, crime_data, time_data[0].month_year)
        }
      })
  }



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
