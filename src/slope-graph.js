import {select} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import {getCounts} from './utils';
import {nest} from 'd3-collection';
import {min, max} from 'd3-array';
import {Delaunay} from 'd3-delaunay';

export default function slopeGraph(isrs, crimes) {
  var isr_data = getCounts(isrs, 'DISTRICT');
  var crime_data = getCounts(crimes, 'district');
  var isrs_crimes = [];
  for (let [key, value] of Object.entries(isr_data)) {
    isrs_crimes.push({district: key, value: value, type: 'isrs'});
  }
  for (let [key, value] of Object.entries(crime_data)) {
    isrs_crimes.push({district: key, value: value, type: 'crimes'});
  }
  console.log(isrs_crimes);

  var nestedByName = nest()
    .key(function(d) {
      return d.district;
    })
    .entries(isrs_crimes);

  nestedByName = nestedByName.filter(function(d) {
    return d.values.length > 1;
  });
  console.log(nestedByName);
  var margin = {top: 100, right: 275, bottom: 40, left: 275};

  var width = 960 - margin.left - margin.right,
    height = 760 - margin.top - margin.bottom;

  var svg = select('#slope-graph')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var y_isrs_min = min(nestedByName, d => d.values[0].value);
  var y_isrs_max = max(nestedByName, d => d.values[0].value);
  var y_crimes_min = min(nestedByName, d => d.values[1].value);
  var y_crimes_max = max(nestedByName, d => d.values[1].value);
  var yScale = scaleLinear()
    .range([height, 0])
    .domain([
      Math.min(y_isrs_min, y_crimes_min),
      Math.max(y_isrs_max, y_crimes_max),
    ]);

  var config = {
    xOffset: 0,
    yOffset: 0,
    width: width,
    height: height,
    labelPositioning: {
      alpha: 0.5,
      spacing: 18,
    },
    leftTitle: 'ISRs',
    rightTitle: 'Crimes',
    labelGroupOffset: 5,
    labelKeyOffset: 50,
    radius: 6,
    // Reduce this to turn on detail-on-hover version
    unfocusOpacity: 0.3,
  };
  var slopeGraph = svg
    .append('g')
    .attr('class', 'slope-graph')
    .attr('transform', 'translate(' + [config.xOffset, config.yOffset] + ')');

  var voronoi = Delaunay()
    .x(d => (d.type == 'isrs' ? 0 : width))
    .y(d => yScale(d.value))
    .extent([
      [-margin.left, -margin.top],
      [width + margin.right, height + margin.bottom],
    ]);
  console.log(voronoi);
}
