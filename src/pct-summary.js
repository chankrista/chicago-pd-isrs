import {groupBy} from './utils.js';
import {scaleBand, scaleLinear, scaleOrdinal} from 'd3-scale';
import {select} from 'd3-selection';
import {schemeSpectral} from 'd3-scale-chromatic';
import {axisTop, axisLeft} from 'd3-axis';
import {stack, stackOffsetExpand} from 'd3-shape';
import {slice} from 'd3-array';
import {format} from 'd3-format';

export default function pctChart(dist_data, dist_isrs, time_data, time_isrs) {
  var dist_camera = groupBy(dist_data, 'BODY_CAMERA_I');
  var time_camera = groupBy(time_data, 'BODY_CAMERA_I');
  var data = [
    {
      name: 'District ' + dist_data[0].DISTRICT,
      Y: dist_camera[0].value,
      N: dist_camera[1].value,
    },
    {name: 'Citywide', Y: time_camera[0].value, N: time_camera[1].value},
  ];
  console.log(data);

  var series = stack()
    .keys(['Y', 'N'])
    .offset(stackOffsetExpand)(data)
    .map(d => (d.forEach(v => (v.key = d.key)), d));
  console.log(series);

  var margin = {top: 20, right: 231, bottom: 140, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  var x = scaleLinear().range([margin.left, width - margin.right]);

  var y = scaleBand()
    .rangeRound([height, 0])
    .padding(0.1)
    .range([margin.top, height - margin.bottom])
    .domain(['District ' + dist_data[0].DISTRICT, 'Citywide']);

  var color = scaleOrdinal()
    .domain(dist_camera.map(d => d.BODY_CAMERA_I))
    .range(['#E28413', '#000022'])
    .unknown('#ccc');

  var xAxis = function(g) {
    g.attr('transform', `translate(0,${margin.top})`)
      .call(axisTop(x).ticks(width / 100, '%'))
      .call(g => g.selectAll('.domain').remove());
  };

  var y = function(r) {
    r.attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(r).tickSizeOuter(0))
      .call(r => r.selectAll('.domain').remove());
  };

  var formatPercent = format('.1%');
  var formatValue = x => (isNaN(x) ? 'N/A' : x.toLocaleString('en'));

  var svg = select('#district-graph')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg
    .append('g')
    .selectAll('g')
    .data(series)
    .enter()
    .append('g')
    .attr('fill', d => color(d.key))
    .selectAll('rect')
    .data(d => d)
    .join('rect')
    .attr('x', d => x(d[0]))
    .attr('y', (d, i) => y(d.data.name))
    .attr('width', d => x(d[1]) - x(d[0]))
    .attr('height', y.bandwidth())
    .append('title')
    .text(
      d =>
        `${d.data.name} ${d.key} ${formatPercent(d[1] - d[0])} ${formatValue(
          d.data[d.key],
        )}`,
    );

  svg.append('g').call(xAxis);
  svg.append('g').call(yaxis);
}
