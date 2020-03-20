import { groupBy } from "./utils";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { stack, stackOrderDescending } from "d3-shape";
import { slice, range, max } from "d3-array";
import { schemeCategory10 } from "d3-scale-chromatic";
import { axisLeft, axisBottom } from "d3-axis";


export default function bodyCamera(full_data) {
  var districts = [...new Set(full_data.map(d => d.DISTRICT))];
  var data = new Array();
  for (let i = 0; i < districts.length; i++) {
    var district_data = full_data.filter(d => {
      return d.DISTRICT === districts[i];
    });
    var body_cam = groupBy(district_data, "BODY_CAMERA_I");
    data[i] = {
      district: districts[i],
      N: body_cam[0].y,
      Y: body_cam[1].y,
      total: parseInt(body_cam[0].y) + parseInt(body_cam[1].y)
    };
  }
  var stacker = stack()
    .keys(["N", "Y"])
    .order(stackOrderDescending);

  var series = stacker(data);
  console.log(series);
  var svg = select("#body-cameras"),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  

  var y = scaleBand()			// x = d3.scaleBand()	
    .rangeRound([0, height])	// .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

  var x = scaleLinear()		// y = d3.scaleLinear()
    .rangeRound([0, width]);	// .rangeRound([height, 0]);

  var z = scaleOrdinal()
    .range(["#98abc5", "#8a89a6"]);

  y.domain(data.map(function (d) { return d.district; }));					// x.domain...
  x.domain([0, max(data, function (d) { return d.total; })]).nice();	// y.domain...
  z.domain(["N", "Y"]);

  g.append("g")
    .selectAll("g")
    .data(series)
    .enter().append("g")
    .attr("fill", function (d) { return z(d.key); })
    .selectAll("rect")
    .data(function (d) { return d; })
    .enter().append("rect")
    .attr("y", function (d) { return y(d.data.district); })	    //.attr("x", function(d) { return x(d.data.State); })
    .attr("x", function (d) { return x(d[0]); })			    //.attr("y", function(d) { return y(d[1]); })	
    .attr("width", function (d) { return x(d[1]) - x(d[0]); })	//.attr("height", function(d) { return y(d[0]) - y(d[1]); })
    .attr("height", y.bandwidth());						    //.attr("width", x.bandwidth());	

  g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0,0)") 						//  .attr("transform", "translate(0," + height + ")")
    .call(axisLeft(y));									//   .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")				// New line
    .call(axisBottom(x).ticks(null, "s"))					//  .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("y", 2)												//     .attr("y", 2)
    .attr("x", x(x.ticks().pop()) + 0.5) 						//     .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")										//     .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text("Population")
    .attr("transform", "translate(" + (-width) + ",-10)");   	// Newline

  var legend = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(["N", "Y"])
    .enter().append("g")
    .attr("transform", function (d, i) { return "translate(-50," + (300 + i * 20) + ")"; });

  legend.append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", z);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function (d) { return d; });


}
