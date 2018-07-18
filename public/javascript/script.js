var canvas;
var context;
let expenses = {};
let incomes = {};
let totalExpense = 0;

// Toggle expense/income dropdown options
$("#transaction").change( () => {
	if($("#inc").hasClass("hide")) {
		$("#exp").removeClass("show");
		$("#exp").addClass("hide");
		$("#inc").removeClass("hide");
		$("#inc").addClass("show");
	} else {
		$("#inc").removeClass("show");
		$("#inc").addClass("hide");
		$("#exp").removeClass("hide");
		$("#exp").addClass("show");
	}	
});

$("#form").submit(function(e){
  e.preventDefault();
});

$("#btn-submit").click( () => {
	let date = $("#date").val();
	let transaction = $("#transaction").prop("checked") ? "income" : "expense";
	let category = $("#inc").hasClass("hide") ? $("#expense").val() : $("#income").val();
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

		let todayTotalExpense = 0;
		let monthTotalExpense = 0;
		let yearTotalExpense = 0;

		let todayTotalIncome = 0;
		let monthTotalIncome = 0;
		let yearTotalIncome = 0;
		let totalIncome = 0;

		let now = new Date();
		let current = {year: now.getYear()+1900, 
											month: now.getMonth()+1, 
											day: now.getDate()
		};

		// Reset "global" totals
		totalExpense = 0;
		for(let category in expenses) {
			expenses[category].total = 0;
		}
		for(let category in incomes) {
			incomes[category].total = 0;
		}

		recs.forEach( (rec) => {
			// Accummulate totals by category
			if(rec.transaction === "expense") {
				expenses[rec.category].total += Number(rec.amount);
			} else {
				incomes[rec.category].total += Number(rec.amount);
			}

			// Calculate values for Summary
			recYMD = rec.date.split("-");
			let year = recYMD[0];
			let month = recYMD[1];
			let day = recYMD[2];

			if(rec.transaction === "expense") {
				if(year == current.year) {
					yearTotalExpense += Number(rec.amount);
					if(month == current.month) {
						monthTotalExpense += Number(rec.amount);
						if(day == current.day) {
							todayTotalExpense += Number(rec.amount);
						}
					}
				}
				totalExpense += Number(rec.amount);
			} else {
				if(year == current.year) {
					yearTotalIncome += Number(rec.amount);
					if(month == current.month) {
						monthTotalIncome += Number(rec.amount);
						if(day == current.day) {
							todayTotalIncome += Number(rec.amount);
						}
					}
				}
				totalIncome += Number(rec.amount);
			}
		});	// End recs.forEach()

		summary.append("<p>Daily Income: " + todayTotalIncome + "</p>");
		summary.append("<p>Daily Expense: " + todayTotalExpense + "</p>");
		summary.append("<p>Daily Balance: " + (todayTotalIncome - todayTotalExpense) + "</p>");
		summary.append("<hr>");
		summary.append("<p>Monthly Income: " + monthTotalIncome + "</p>");
		summary.append("<p>Monthly Expense: " + monthTotalExpense + "</p>");
		summary.append("<p>Monthly Balance: " + (monthTotalIncome - monthTotalExpense) + "</p>");
		summary.append("<hr>");
		summary.append("<p>Yearly Income: " + yearTotalIncome + "</p>");
		summary.append("<p>Yearly Expense: " + yearTotalExpense + "</p>");
		summary.append("<p>Yearly Balance: " + (yearTotalIncome - yearTotalExpense) + "</p>");
		summary.append("<hr>");
		summary.append("<p>Total Income: " + totalIncome + "</p>");
		summary.append("<p>Total Expense: " + totalExpense + "</p>");
		summary.append("<p>Total Balance: " + (totalIncome - totalExpense) + "</p>");
		summary.append("<br>");

		// Render chart and key 
		draw();
	});
});


// Execute on page load/refresh
function init() {
	// Initialize date input with today's date
	let d = new Date();
	let year = d.getFullYear();
	let month = d.getMonth() + 1;
	let day = d.getDate();
	let dateString = year + "-" + pad(month) + "-" + pad(day);
	document.getElementById("date").value = dateString;

	// Initialize 'expenses' and 'incomes' objects
	$("#exp option").each(function() {
		expenses[$(this).val()] = {color: getRandomColor(), total: 0};
	});
	$("#inc option").each(function() {
		incomes[$(this).val()] = {color: getRandomColor(), total: 0};
	});

	// Get canvas graphics context
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	// Clear cache on page refresh
	clearHistory()
	
	
	// Register canvas dimensions onload
	resizeCanvas();
	
	// Add listener to adjust canvas to match window resize, and redraw the pie chart
	window.addEventListener('resize', refreshCanvas, false);
}


// Clear database entries
function clearHistory() {
	//expenses = [];
	
	// Clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// Clear key
	keyDiv = document.getElementById("key");
	while (keyDiv.firstChild) {
	    keyDiv.removeChild(keyDiv.firstChild);
	}
	
}


function draw() {
	drawPieChart(canvas.width/2, canvas.height/2, canvas.width*.35);
	drawKey();
}


// Draw pie chart one section (category) at a time
function drawPieChart(x, y, radius) {
	// Current pie section's ratio to the entire pie
	let ratio;
	
	// Starting and ending angles of each pie section
	let startingAngle = 0;
	let endingAngle = 0;
	
	for(let key in expenses) {
	  context.beginPath();

		context.fillStyle = expenses[key].color;
	
		ratio = expenses[key].total/totalExpense;
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

	// Create elements to append
	for(let key in expenses) {
		var item = document.createElement("div");
		var label = document.createElement("label");
		var colorBox = document.createElement("div");
	
		// style colorBox
		colorBox.style.width = "20px";
		colorBox.style.height = "20px";
		colorBox.style.background = expenses[key].color;
		colorBox.style.border = "solid thin #000000";
		colorBox.style.display = "inline-block";
		colorBox.style.margin = "5px";
		colorBox.style.float = "left";
		
		// Style label next to colorBox
		label.innerHTML = key;
		label.style.textAlign = "left";
		label.style.width = "auto";
		label.style.margin = "4px";
		
		// Style item container for colorBox and label
		item.style.width = "auto";
		item.style.textAlign = "left";
		
		// Attach elements to DOM
		item.appendChild(colorBox);
		item.appendChild(label);
		keyDiv.appendChild(item);
	}
}


// Helper functions

// Pad day and month with 0 to conform to date format
function pad(val) {
	return val < 10 ? "0" + val : val;
}

// Generate random color
function getRandomColor() {
		let red = Math.trunc(Math.random()*255);
		let green = Math.trunc(Math.random()*255);
		let blue = Math.trunc(Math.random()*255);
		return "rgb(" + red + "," + green + "," + blue + ")";
}

// Update canvas dimensions and redraw pie chart
function refreshCanvas() {
    resizeCanvas();
    drawPieChart(canvas.width/2, canvas.height/2, canvas.width*.45);
}

// Match canvas dimensions to the resizing parent wrapper-div
function resizeCanvas() {
    canvas.width = document.getElementById("canvas-wrapper").clientWidth;
    canvas.height = document.getElementById("canvas-wrapper").clientHeight;
}
