const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('database.db');

db.run(`CREATE TABLE IF NOT EXISTS general (
    siteTitle TEXT,
    siteSubtitle TEXT,
    numberOfPosts INTEGER
)`);

//db.run(`INSERT INTO general(siteTitle) VALUES('the Site Title !' )`); 


exports.getSiteTitle = function(callback) {
    const query = "SELECT * FROM general";

    db.all(query, function(error, general) {
        callback(error, general)
    });
};

exports.setSiteTitle = function(siteTitle, callback) {
    const query = "UPDATE general SET siteTitle VALUE ?"
    const values = [siteTitle];

    db.run(query, values, function(error) {

        callback(error);

    });
};