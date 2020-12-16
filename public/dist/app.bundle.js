/******/ (() => { // webpackBootstrap
// let saveRecord = require("./indexedDB");
var transactions = [];
var myChart; // route

fetch("/api/transaction").then(function (response) {
  return response.json();
}).then(function (data) {
  // save db data on global variable
  transactions = data;
  populateTotal();
  populateTable();
  populateChart();
});

function populateTotal() {
  // reduce transaction amounts to a single total value
  var total = transactions.reduce(function (total, t) {
    return total + parseInt(t.value);
  }, 0);
  var totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  var tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";
  transactions.forEach(function (transaction) {
    // create and populate a table row
    var tr = document.createElement("tr");
    tr.innerHTML = "\n      <td>".concat(transaction.name, "</td>\n      <td>").concat(transaction.value, "</td>\n    ");
    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  var reversed = transactions.slice().reverse();
  var sum = 0; // create date labels for chart

  var labels = reversed.map(function (t) {
    var date = new Date(t.date);
    return "".concat(date.getMonth() + 1, "/").concat(date.getDate(), "/").concat(date.getFullYear());
  }); // create incremental values for chart

  var data = reversed.map(function (t) {
    sum += parseInt(t.value);
    return sum;
  }); // remove old chart if it exists

  if (myChart) {
    myChart.destroy();
  }

  var ctx = document.getElementById("myChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: "Total Over Time",
        fill: true,
        backgroundColor: "#6666ff",
        data: data
      }]
    }
  });
}

function sendTransaction(isAdding) {
  var nameEl = document.querySelector("#t-name");
  var amountEl = document.querySelector("#t-amount");
  var errorEl = document.querySelector(".form .error"); // validate form

  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  } else {
    errorEl.textContent = "";
  } // create record


  var transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  }; // if subtracting funds, convert amount to negative number

  if (!isAdding) {
    transaction.value *= -1;
  } // add to beginning of current array of data


  transactions.unshift(transaction); // re-run logic to populate ui with new record

  populateChart();
  populateTable();
  populateTotal(); // also send to server

  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data.errors) {
      errorEl.textContent = "Missing Information";
    } else {
      // clear form
      nameEl.value = "";
      amountEl.value = "";
    }
  })["catch"](function (err) {
    // fetch failed, so save in indexed db
    // console.error(err);
    console.log("saved to indexedDB", transaction);
    saveRecord(transaction); // clear form

    nameEl.value = "";
    amountEl.value = "";
  });
}

document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false);
};
/******/ })()
;