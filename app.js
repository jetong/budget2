// Dependencies
const express = require('express');
const morgan = require('morgan');
const Record = require('./record.js');

const app = express();
app.use(morgan('dev'));
app.use('/public', express.static('public'));

app.use('/update', (req, res) => {
	let date = req.query.date;
	let transaction = req.query.transaction;
	let category = req.query.category;
	let amount = req.query.amount;

	let newRecord = new Record({
		date: date,
		transaction: transaction,
		category: category,
		amount: amount,
	});

	// Insert record to Mongo
	newRecord.save((err) => {
    if(err) {
      res.type('html').status(500);
      res.send('Error: ' + err);
    } 

		// Retrieve all records for summary data
		Record.find( {}, (err, records) => {
			if(err) {
				res.type("html").status(500);
				res.send("Error: " + err);
			} else {
				res.json(records);
			}
		}); 
  });


});	// end app.use()


app.listen(3001, () => {
	console.log("Listening on port 3001");
});
