// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'
// (I tend to think it's best to use screaming snake case for imported json)
const domReady = require("domready");
import { csv, json } from "d3-fetch";
import "./stylesheets/main.css";
import lineChart from "./line-chart";
import districtMap from "./district-map.js";
import summaryStats from "./summary-stats.js"

// this will make your loading process 1 million times faster
const prefix = window.location.origin.startsWith("http://localhost:")
  ? "."
  : // you should modify this link when you figure out what the new appropriate raw data source is for this repo
  "https://raw.githubusercontent.com/chankrista/chankrista.github.io/master/interactive-portfolio";
domReady(() => {
  Promise.all([
    csv(`${prefix}/data/isrs_clean.csv`),
    csv(`${prefix}/data/crimes_16-18.csv`),
    // i changed the name of this file
    json(`${prefix}/data/Boundaries-PoliceDistricts(current).geojson`)
  ]).then(d => {
    const [data, crimes, districts] = d;
    app(data, crimes, districts);
  });
});

function app(data, crimes, districts) {
  function render() {
    districtMap(data, crimes, districts, true);
    districtMap(data, crimes, districts, false);
    lineChart(data, crimes, districts);
    summaryStats(0, data, crimes);
  }
  render();
}
