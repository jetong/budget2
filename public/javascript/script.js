var canvas;
var context;
var colors = [];
var expenses = [];

let today = new Date().toISOString().substr(0, 10);
document.getElementById("date").value = today;

$("#form").submit(function(e){
  e.preventDefault();
});

$("#btn-submit").click( () => {
	let date = $("#date").val();
	let transaction = $("#transaction").prop("checked") ? "income" : "expense";
	let category = $("#category").val();
	let amount = $("#amount").val();

	let query = "?";
	if (date) query += "date=" + date + "&";
	if (transaction) query += "transaction=" + transaction + "&";
	if (category) query += "category=" + category + "&";
	if (amount) query += "amount=" + amount;

	var url = "http://18.218.116.239:3001/update/" + query;

	$.getJSON(url, (records, status) => {
		let summary = $("#summary");
		summary.html("");
		recs = Array.from(records);

		let todayCount = 0;
		let todayTotal = 0;
		let monthCount = 0;
		let monthTotal = 0;
		let yearCount = 0;
		let yearTotal = 0;
		let totalCount = 0;
		let total = 0;

		let now = new Date();
		let current = {year: now.getYear()+1900, 
											month: now.getMonth()+1, 
											day: now.getDate()
		};

		recs.forEach( (rec) => {
			recYMD = rec.date.split("-");		// Year-Month-Day
			let year = recYMD[0];
			let month = recYMD[1];
			let day = recYMD[2];

			// This Year
			if(year == current.year) {
				yearCount++;
				yearTotal += Number(rec.amount);

				// This Month
				if(month == current.month) {
					monthCount++;
					monthTotal += Number(rec.amount);

					// Today
					if(day == current.day) {
						todayCount++;
						todayTotal += Number(rec.amount);
					}
				}
			}

			// Total
			totalCount++;
			total += Number(rec.amount);

		});

		summary.append("<li>Daily Total: " + todayTotal + "</li>");
		summary.append("<br>");
		summary.append("<li>Monthly Total: " + monthTotal + "</li>");
		summary.append("<br>");
		summary.append("<li>Yearly Total: " + yearTotal + "</li>");
		summary.append("<br>");
		summary.append("<li>Grand total: " + total + "</li>");
		summary.append("<br>");

	});
});


// Execute on page load/refresh
function init() {
	console.log("initializing");
	// Get canvas graphics context
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	// Clear cache on page refresh
	startOver()
	
	// Initialize rgb values for categories
	randomizeColors();
	
	// Register canvas dimensions onload
	resizeCanvas();
	
	// Add listener to adjust canvas to match window resize, and redraw the pie chart
	window.addEventListener('resize', refreshCanvas, false);
}


// Execute on 'submit expenses' button click
function main() {
// Process form and store values in cache
processForm();
// Render visual data
draw();
// Display balance
displayBalance();
}


// Execute on 'start over' button click
function startOver() {
// Clear session stored values
sessionStorage.clear();
expenses = [];

// Clear input fields
//var fields = document.getElementsByTagName("input");
//for(var i = 0; i < fields.length; i++) {
//    fields[i].value = "";
//}
//document.getElementById("balance").style.background = "";

// Clear canvas
context.clearRect(0, 0, canvas.width, canvas.height);

// Clear key
keyDiv = document.getElementById("key");
while (keyDiv.firstChild) {
    keyDiv.removeChild(keyDiv.firstChild);
}

randomizeColors();
}


function processForm() {
// Initialize map for expense categories
var prevExpenses = {};
var inputElements = document.getElementsByClassName("expenses");
var keys = [];
for(var i = 0; i < inputElements.length; i++) {
    keys[i] = inputElements[i].id;
// If current key is undefined, define it with value 0
if(!prevExpenses[keys[i]]) {
  prevExpenses[keys[i]] = 0;
}
}

// Get previous key/values from sessionStorage and store into map
// Note: Doesn't execute on first run as there are no stored key/values initially and the length is 0.
for(var i = 0; i < Object.keys(sessionStorage).length; i++) {
    var key = Object.keys(sessionStorage)[i];
    var value = sessionStorage.getItem(key);
    prevExpenses[key] = parseInt(value);
}

// Get current values submitted by user and accumulate into prevExpenses map
for(var i = 0; i < inputElements.length; i++) {
    if(inputElements[i].value) {
      prevExpenses[inputElements[i].id] += parseInt(inputElements[i].value);
      expenses[i] = prevExpenses[inputElements[i].id];
} else { // In case field input is empty/undefined
  prevExpenses[inputElements[i].id] += 0;
}
}

// Set storage to the latest cumulative total
for(var key in prevExpenses) {
    sessionStorage.setItem(key, parseInt(prevExpenses[key]));
}
}


function draw() {
    drawPieChart(canvas.width/2, canvas.height/2, canvas.width*.4);
    drawKey();
}


// Draw pie chart one section (category) at a time
function drawPieChart(x, y, radius) {
// Current pie section's ratio to the entire pie
var ratio;

// Sum up expenses to calculate individual ratios
var totalExpenses = 0;
for(var i = 0; i < expenses.length; i++) {
    totalExpenses += expenses[i];
}

// Starting and ending angles of each pie section
var startingAngle = 0;
var endingAngle = 0;

for(var i = 0; i < expenses.length; i++) {
    context.beginPath();

    context.fillStyle = colors[i];

    ratio = expenses[i]/totalExpenses;
    endingAngle = startingAngle + Math.PI*2*ratio;

    context.arc(x, y, radius, startingAngle, endingAngle);
    context.lineTo(x, y);
    context.fill();
    context.stroke();
    context.closePath();
    startingAngle = endingAngle;
}
}


// Dynamically create key for pie chart
function drawKey() {
    keyDiv = document.getElementById("key");

// Remove previous key items
while (keyDiv.firstChild) {
    keyDiv.removeChild(keyDiv.firstChild);
}

// Append new key items
var inputElements = document.getElementsByClassName("expenses");
for(var i = 0; i < inputElements.length; i++) {
    var item = document.createElement("div");
    var label = document.createElement("label");
    var colorBox = document.createElement("div");

// style colorBox
colorBox.style.width = "20px";
colorBox.style.height = "20px";
colorBox.style.background = colors[i];
colorBox.style.border = "solid thin #000000";
colorBox.style.display = "inline-block";
colorBox.style.margin = "5px";
colorBox.style.float = "left";

// Style label next to colorBox
label.innerHTML = inputElements[i].id;
label.style.textAlign = "left";
label.style.width = "auto";
label.style.margin = "7px";

// Style item container for colorBox and label
item.style.width = "auto";
item.style.textAlign = "left";

// Attach items to DOM
item.appendChild(colorBox);
item.appendChild(label);
keyDiv.appendChild(item);
}
}


// Display balance for current session
function displayBalance() {
    var income = document.getElementById("income").value || 0;

    var totalExpenses = 0;
    for(var i = 0; i < expenses.length; i++) {
        totalExpenses += expenses[i];
    }

    var balance = income - totalExpenses;
    document.getElementById("balance").value = balance;
    if(balance < 0) {
        document.getElementById("balance").style.background = "#ffdddd";
    } else {
        document.getElementById("balance").style.background = "#ddffdd";
    }
}


// Helper functions

// Fill colors[] with random colors for each expense category
function randomizeColors() {
    var categories = document.getElementsByClassName("expenses");
    for(var i = 0; i < categories.length; i++) {
        var red = Math.trunc(Math.random()*255);
        var green = Math.trunc(Math.random()*255);
        var blue = Math.trunc(Math.random()*255);
        colors[i] = "rgb(" + red + "," + green + "," + blue + ")";
    }
}


// Update canvas dimensions and redraw pie chart
function refreshCanvas() {
    resizeCanvas();
    drawPieChart(canvas.width/2, canvas.height/2, canvas.width*.4);
}


// Match canvas dimensions to the resizing parent wrapper-div
function resizeCanvas() {
    canvas.width = document.getElementById("canvas-wrapper").clientWidth;
    canvas.height = document.getElementById("canvas-wrapper").clientHeight;
}

