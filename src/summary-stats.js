import {select} from 'd3-selection';
import {geoAlbers, geoPath} from 'd3-geo';
import pctChart from './pct-summary.js';

export default function summaryStats(dist, isrs, crimes, dist_geo) {
  var time_data = isrs.filter(row => row.year == '2018');
  var time_isrs = time_data.length;
  var time_crimes = crimes.filter(row => row.year == '2018').length;
  var dist_data = isrs.filter(
    row => (row.year == '2018') & (row.DISTRICT == dist),
  );
  var dist_isrs = dist_data.length;
  var dist_crimes = crimes.filter(
    row => (row.year == '2018') & (row.district == dist),
  ).length;
  select('#summary_isrs').html(
    '<p>In 2018, there were <b>' +
      dist_isrs +
      ' ISRs</b> in district ' +
      dist +
      ', which is <b>' +
      Math.round((dist_isrs / time_isrs) * 100) +
      '%</b> of the citywide total.</p>',
  );
  select('#summary_crimes').html(
    '<p>In 2018, there were <b>' +
      dist_crimes +
      ' crimes</b> in district ' +
      dist +
      ', which is <b>' +
      Math.round((dist_crimes / time_crimes) * 100) +
      '%</b> of the citywide total.</p>',
  );
  var width = 500;
  var height = 500;
  select('#district-map')
    .selectAll('*')
    .remove();
  var svg = select('#district-map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  var g = svg.append('g');
  // turf geopackage. method called center, center of mass, centroid
  //NEED TO FIGURE OUT A WAY TO GET CENTROIDS
  // Append empty placeholder g element to the SVG
  // g will contain geometry elements
  //
  // console.log(dist_geo[0].geometry.coordinates[0]);
  //   function find_min(coords, min) {
  //     if ((typeof coords[0] == 'number') & (coords[0] < min)) {
  //       return coords[0];
  //     } else if (typeof coords[0] == 'number') {
  //       return min;
  //     }
  //     for (var i = 0; i < coords.length; i++) {
  //       find_min(coords[i], min);
  //     }
  //   }
  //   var coord_x = find_min(dist_geo[0].geometry.coordinates, 0);
  //   console.log(coord_x);
  //   var coord_y = dist_geo[0].geometry.coordinates.map(y =>
  //     find_centroid(y, false),
  //   );
  // var min_x = 90;
  // for (var i = 0; i < dist_geo[0].geometry.coordinates[0]; i++) {
  //   if (dist_geo[0].geometry.coordinates[0][i][0] < min_x) {
  //     min_x = dist_geo[0].geometry.coordinates[0][i][0];
  //   }
  // }
  // console.log(min_x);
  // console.log(...dist_geo[0].geometry.coordinates[0].map(x => x[0][0]));
  // var min_x = Math.min(...dist_geo[0].geometry.coordinates[0].map(x => x[0]));
  // console.log(min_x);
  // var max_x = Math.max(coord_x);
  // var min_y = Math.min(coord_y);
  // var max_y = Math.max(coord_y);

  var albersProjection = geoAlbers()
    .scale(70000)
    .rotate([87.6416, 0])
    .center([0, 41.8779])
    .translate([width / 2, height / 2]);

  var path_fn = geoPath().projection(albersProjection);

  g.selectAll('path')
    .data(dist_geo)
    .enter()
    .append('path')
    .attr('stroke', '#333')
    .attr('d', path_fn)
    .attr('stroke-opacity', 0.5)
    .attr('stroke-width', 1);

  pctChart(dist_data, dist_isrs, time_data, time_isrs);
}
