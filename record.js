const mongoose = require('mongoose');
var uri = "mongodb+srv://admin:admin@cluster0-ue1al.mongodb.net/test?retryWrites=true";
mongoose.connect(uri, { useNewUrlParser: true });

const Schema = mongoose.Schema;
let recordSchema = new Schema({
            		date: String,
         transaction: String,
            category: String,
              amount: String
});

module.exports = mongoose.model('Record', recordSchema);
