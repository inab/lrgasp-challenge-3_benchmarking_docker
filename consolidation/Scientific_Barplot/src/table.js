import * as JQuery from "jquery";

const $ = JQuery.default;

export function transform_classif_to_table(
  divid,
  data,
  quantile_1,
  quantile_2,
  quantile_3
) {
  // split participants according to quartiles
  for (var i = 0; i < data.length; i++) {
    var participant = data[i];
    if (participant.metric_value >= quantile_3) {
      participant["quartile"] = 1;
    } else if (
      participant.metric_value < quantile_3 &&
      participant.metric_value >= quantile_2
    ) {
      participant["quartile"] = 2;
    } else if (
      participant.metric_value < quantile_2 &&
      participant.metric_value >= quantile_1
    ) {
      participant["quartile"] = 3;
    } else {
      participant["quartile"] = 4;
    }
  }

  fill_in_table(divid, data);
  set_cell_colors(divid);
}

function fill_in_table(divid, data) {
  //create table dinamically
  var table = document.getElementById(divid + "_table");

  var row = table.insertRow(-1);
  row.insertCell(0).innerHTML = "<b>TOOL</b>";
  row.insertCell(1).innerHTML = "<b>QUARTILE</b>";

  data.forEach(function (element) {
    var row = table.insertRow(-1);
    row.insertCell(0).innerHTML = element.toolname;
    row.insertCell(1).innerHTML = element.quartile;

    // add id
    var my_cell = row.cells[0];
    my_cell.id =
      divid + "___cell" + element.toolname.replace(/[\. ()/-]/g, "_");
  });
}

function set_cell_colors(divid) {
  var cell = $("#" + divid + "_table td");

  cell.each(function () {
    //loop through all td elements ie the cells

    var cell_value = $(this).html(); //get the value
    if (cell_value == 1) {
      //if then for if value is 1
      $(this).css({ background: "#238b45" }); // changes td to red.
    } else if (cell_value == 2) {
      $(this).css({ background: "#74c476" });
    } else if (cell_value == 3) {
      $(this).css({ background: "#bae4b3" });
    } else if (cell_value == 4) {
      $(this).css({ background: "#edf8e9" });
    } else if (cell_value == "--") {
      $(this).css({ background: "#f0f0f5" });
    } else {
      $(this).css({ background: "#FFFFFF" });
    }
  });
}
