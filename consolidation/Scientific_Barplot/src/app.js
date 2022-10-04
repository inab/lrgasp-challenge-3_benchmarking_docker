import { add_buttons } from "./chart_buttons";
import "./app.css";
import { build_plot } from "./bar_plot";
import * as d3 from "d3";
import * as JQuery from "jquery";
const $ = JQuery.default;
window.d3 = d3;

var metrics_values = {};

function load_bars_visualization() {
  var charts = document.getElementsByClassName("benchmarkingChart_bars");
  var i = 0;
  var chart;

  // append ids to chart/s and make d3 plot
  for (chart of charts) {
    // read attributes
    const data = $(chart).data("data");
    const metric_name = $(chart).data("metric-name");
    const dataId = chart.getAttribute("data-id");
    //set chart id
    const divid = (dataId + i).replace(":", "_");
    chart.id = divid;

    // push metrics to metrics array
    metrics_values[divid] = data;

    // add plot limits
    const margin = { top: 40, right: 30, bottom: 180, left: 60 }
    const width = Math.round($(window).width() * 0.70226) - margin.left - margin.right
    const height = Math.round($(window).height() * 0.8888) - margin.top - margin.bottom;
    const min_y = 0;

    add_buttons(data, divid, width, margin, height, metric_name, min_y);
    build_plot (data, divid, width, margin, height, metric_name, min_y);

    i++;
  }
}

export { load_bars_visualization, metrics_values };
load_bars_visualization();
