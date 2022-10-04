import { build_plot } from "./bar_plot";
import { transform_classif_to_table } from "./table";
import * as JQuery from "jquery";
const $ = JQuery.default;

export function sort_and_classify(
  data,
  divid,
  width,
  margin,
  height,
  metric_name,
  min_y
) {
  //make a shallow copy (not reference) of the data that will be sorted
  const data_copy = [...data];
  // sort data
  let sorted_data = data_copy.sort(function (b, a) {
    return a.metric_value - b.metric_value;
  });

  //  build new plot with sorted data
  build_plot(sorted_data, divid, width, margin, height, metric_name, min_y);

  let values = sorted_data
    .map((a) => a.metric_value)
    .sort(function (a, b) {
      return a - b;
    });

  let quantile_1 = d3.quantile(values, 0.25);
  let quantile_2 = d3.quantile(values, 0.5);
  let quantile_3 = d3.quantile(values, 0.75);

  // append lines to svg plot
  var lower_quantile_limit = draw_quartile_line(
    divid,
    quantile_3,
    sorted_data,
    0,
    "1st Quartile",
    width,
    margin,
    height
  );
  lower_quantile_limit = draw_quartile_line(
    divid,
    quantile_2,
    sorted_data,
    lower_quantile_limit,
    "2nd Quartile",
    width,
    margin,
    height
  );
  lower_quantile_limit = draw_quartile_line(
    divid,
    quantile_1,
    sorted_data,
    lower_quantile_limit,
    "3rd Quartile",
    width,
    margin,
    height
  );

  // add last quartile
  var svg = d3.select("#" + divid + "_svg");
  svg
    .append("text")
    .attr("id", function (d) {
      return divid + "___num_bottom_right";
    })
    .attr("x", (width + lower_quantile_limit) / 2 + margin.left)
    .attr("y", margin.top + 30)
    .attr("text-anchor", "middle")
    .style("opacity", 0.4)
    .style("font-size", "2vw")
    .style("fill", "#0A58A2")
    .text("4th Quartile");

  // show results in table format
  if ($("#" + divid + "_table").is(":empty"))
    transform_classif_to_table(divid, data, quantile_1, quantile_2, quantile_3);
}

function draw_quartile_line(
  divid,
  quantile,
  data,
  lower_quantile_limit,
  text,
  width,
  margin,
  height
) {
  // find out which is the quartile limit
  let quantile_limit;
  for (var i = 0; i < data.length; i++) {
    var participant = data[i];
    if (participant.metric_value < quantile) {
      quantile_limit = participant.toolname;
      break;
    }
  }

  ///
  var x = d3
    .scaleBand()
    .range([0, width], 0.1)
    .domain(
      data.map(function (d) {
        return d.toolname;
      })
    )
    .padding(0.4);

  var svg = d3.select("#" + divid + "_svg");

  svg
    .append("g")
    .attr(
      "transform",
      "translate(" +
        (x(quantile_limit) + x.step() / 2 - x.bandwidth() + margin.left) +
        ",0)"
    )
    .append("line")
    .attr("y1", margin.top)
    .attr("y2", height + margin.top)
    .attr("stroke", "#0A58A2")
    .attr("stroke-width", 2)
    .style("stroke-dasharray", "20, 5")
    .style("opacity", 0.4);

  svg
    .append("text")
    .attr("id", function (d) {
      return divid + "___num_bottom_right";
    })
    .attr("x", (x(quantile_limit) + lower_quantile_limit) / 2 + margin.left)
    .attr("y", margin.top + 30)
    .attr("text-anchor", "middle")
    .style("opacity", 0.4)
    .style("font-size", "2vw")
    .style("fill", "#0A58A2")
    .text(text);

  return x(quantile_limit);
}
