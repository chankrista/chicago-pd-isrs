// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'
// (I tend to think it's best to use screaming snake case for imported json)
const domReady = require('domready');
import {csv, json} from 'd3-fetch';
import './stylesheets/main.css';
import lineChart from './line-chart';
import districtMap from './district-map.js';
import slopeGraph from './slope-graph.js';

domReady(() => {
  Promise.all([
    csv(
      'https://raw.githubusercontent.com/chankrista/chankrista.github.io/master/interactive-portfolio/data/isrs_clean.csv',
    ),
    csv(
      'https://raw.githubusercontent.com/chankrista/chankrista.github.io/master/interactive-portfolio/data/crimes_16-18.csv',
    ),
    json(
      'https://raw.githubusercontent.com/chankrista/chankrista.github.io/master/interactive-portfolio/data/Boundaries%20-%20Police%20Districts%20(current).geojson',
    ),
  ]).then(d => {
    const [data, crimes, districts] = d;
    app(data, crimes, districts);
  });
});

function app(data, crimes, districts) {
  function render() {
    //districtMap(data, crimes, districts, true);
    //districtMap(data, crimes, districts, false);
    lineChart(data); //Need to debug NaN issue.
    //slopeGraph(data, crimes);
  }
  render();
}
