const  mongoose  = require("mongoose");
mongoose.Promise  = require("bluebird");
const { DB } = require('./config')
const  connect  =  mongoose.connect(DB, { useNewUrlParser: true  });
module.exports  =  connect;