const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/budget', { useNewUrlParser: true });

const Schema = mongoose.Schema;
let recordSchema = new Schema({
            		date: String,
         transaction: String,
            category: String,
              amount: String
});

module.exports = mongoose.model('Record', recordSchema);
