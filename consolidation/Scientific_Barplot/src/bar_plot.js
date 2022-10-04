import d3Tip from "d3-tip";

export function build_plot(
  data,
  divid,
  width,
  margin,
  height,
  metric_name,
  min_y
) {
  let formatComma = d3.format(",");

  let max_y = d3.max(data, function (d) {
    return d.metric_value;
  });

  var x = d3
    .scaleBand()
    .range([0, width], 0.1)
    .domain(
      data.map(function (d) {
        return d.toolname;
      })
    )
    .padding(0.4);

  var y = d3.scaleLinear().domain([min_y, max_y]).nice().range([height, 0]);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y).ticks(5);

  var tip = d3Tip();
  tip
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function (d) {
      return (
        "<b><strong>" +
        d.toolname +
        "</strong></b><br/><span style='color:red'>value: </span>" +
        formatComma(d.metric_value)
      );
    });

  // add div which will hold the svg
  d3.select("#" + divid + "flex-container")
    .append("div")
    .attr("id", divid + "_svg_container");
  // append the svg element
  let svg = d3
    .select("#" + divid + "_svg_container")
    .append("svg")
    .attr("id", divid + "_svg")
    .attr("class", "benchmarkingSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);

  //add axis labels
  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 60) + ")"
    )
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", ".75vw")
    .text("TOOLS");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", ".75vw")
    .text(metric_name);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.55em")
    .attr("transform", "rotate(-60)");

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("wpc_index");

  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", "orange")
    .attr("x", function (d) {
      return x(d.toolname);
    })
    .attr("width", x.bandwidth())
    // no bar at the beginning thus:
    .attr("height", function (d) {
      return height - y(0) > 0 ? height - y(0) : 0;
    }) // has to be >= 0
    .attr("y", function (d) {
      return y(0);
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  // Animation
  svg
    .selectAll("rect")
    .transition()
    .duration(1000)
    .attr("y", function (d) {
      return y(d.metric_value);
    })
    .attr("height", function (d) {
      return height - y(d.metric_value);
    })
    .delay(function (d, i) {
      return i * 10;
    });
}
