import { groupBy } from "./utils";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { stack, stackOrderDescending } from "d3-shape";
import { slice } from "d3-array";
import { schemeSpectral } from "d3-scale-chromatic";
import { axisLeft, axisTop, range } from "d3-axis";

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
  console.log(stacker(data));
  var series = stacker(data);
  var height = 900;
  var width = 800;
  var margin = { top: 20, right: 15, bottom: 25, left: 25 };
  width = width - margin.hleft - margin.right;
  height = height - margin.top - margin.bottom;
  var yScale = scaleBand()
    .domain(range(data.length))
    .range([0, width])
    .paddingInner(0.05);

  var xScale = scaleLinear()
    .domain([0, Math.max(...data.map(d => d.N + d.Y))])
    .range([height, 0]);

  var color = scaleOrdinal()
    .domain(["N", "Y"])
    .range([schemeSpectral[0], schemeSpectral[2]])
    .unknown("#ccc");

  var svg = select("#body-cameras")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xAxis = function(g) {
    g.attr("transform", `translate(0,${margin.top})`)
      .call(axisTop(x).ticks(width / 100, "%"))
      .call(g => g.selectAll(".domain").remove());
  };
  var yAxis = function(g) {
    g.attr("transform", `translate(${margin.left},0)`)
      .call(axisLeft(y).tickSizeOuter(0))
      .call(g => g.selectAll(".domain").remove());
  };

  svg
    .selectAll("g")
    .append("g")
    .data(data)
    .enter()
    .attr("fill", d => color(d.key))
    .append("g")
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d[0]))
    .attr("y", (d, i) => y(d.data.name))
    .attr("width", d => x(d[1]) - x(d[0]))
    .attr("height", y.bandwidth())
    .append("title")
    .text(
      d => `${d.data.name} ${d.key}
        ${formatPercent(d[1] - d[0])} (${formatValue(d.data[d.key])})`
    );

  svg.append("g").call(xAxis);

  svg.append("g").call(yAxis);
}
