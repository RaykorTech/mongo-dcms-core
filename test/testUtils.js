var mongo = require('mongodb');

var testUtils = {};
testUtils.dbUrl = "mongodb://localhost/Grid-Fs-File-test";

testUtils.clearDb = function(callback) {
    mongo.MongoClient.connect(testUtils.dbUrl, function(err, db) {
        if (err) throw 'fail to connect to database ' + connectionUrl;
        db.dropDatabase(callback);
    });
};


module.exports = testUtils;