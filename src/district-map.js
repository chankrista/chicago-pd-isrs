import { select, selectAll } from "d3-selection";
import { geoAlbers, geoPath } from "d3-geo";
import { getCounts } from "./utils";
import { scaleThreshold, scaleLinear } from "d3-scale";
import { extent, quantile } from "d3-array";
import { schemeBlues, schemeOranges } from "d3-scale-chromatic";
import summaryStats from "./summary-stats.js";

export default function districtMap(data, crimes, districts, isrs) {
  console.log(districts);
  if (isrs) {
    var map_data = data;
  } else {
    var map_data = crimes;
  }
  var data_clean = map_data.map(function(d) {
    const row = { ...d };
    if (isrs) {
      var dist = row.DISTRICT;
      if (dist.length > 2) {
        row.DISTRICT = dist.substring(0, dist.length - 2);
      }
    } else {
      row.DISTRICT = Number(row.district);
    }
    return row;
  });

  // var by_district = getCounts(data.map(d => ({...d, district: Number(d.district)})), 'district');
  var by_district = getCounts(data_clean, "DISTRICT");
  Object.keys(by_district)
    .filter(key => key === "" || key === "51")
    .forEach(key => delete by_district[key]);

  // Width and Height of the whole visualization
  var width = 700;
  var height = 580;

  var svg = select(isrs ? "#map-isrs" : "#map-crimes")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Append empty placeholder g element to the SVG
  // g will contain geometry elements
  var g = svg.append("g");

  var albersProjection = geoAlbers()
    .scale(70000)
    .rotate([87.6416, 0])
    .center([0, 41.8779])
    .translate([width / 2, height / 2]);

  var path_fn = geoPath().projection(albersProjection);

  // if (isrs) {
  //     var color_scheme = schemeBlues[9];
  // } else {
  //     var color_scheme = schemeOranges[9];
  // }
  const color_scheme = isrs ? schemeBlues[9] : schemeOranges[9];

  var color_min = Math.min(...Object.values(by_district));
  var color_max = Math.max(...Object.values(by_district));

  var color = scaleLinear()
    .domain([color_min, color_max])
    .range([color_scheme[0], color_scheme[color_scheme.length - 1]]);

  g.selectAll("path")
    .data(districts.features)
    .enter()
    .append("path")
    .attr("fill", function(d) {
      return color(by_district[parseInt(d.properties.dist_num)]);
    })
    .attr("stroke", "#333")
    .attr("d", path_fn)
    .attr("stroke-opacity", 0.5)
    .attr("stroke-width", 1)
    .attr("class", d => d.properties.dist_label)
    .on("click", function(d) {
      selectAll("path")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", 1);
      var paths = document.getElementsByClassName(d.properties.dist_label);
      paths[0].setAttribute("stroke-opacity", 1);
      paths[0].setAttribute("stroke-width", 3);
      paths[1].setAttribute("stroke-opacity", 1);
      paths[1].setAttribute("stroke-width", 3);
      var dist_geo = districts.features.filter(
        row => row.properties.dist_num == d.properties.dist_num
      );
      summaryStats(d.properties.dist_num, data, crimes, dist_geo);
    });
}
