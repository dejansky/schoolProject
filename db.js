const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('database.db');


db.run(`CREATE TABLE IF NOT EXISTS panel_pages(
    id TEXT PRIMARYKEY UNIQUE,
    title TEXT,
    subtitle TEXT
)`, insertData);

db.run(`CREATE TABLE IF NOT EXISTS general_settings (
    id TEXT PRIMARYKEY,
    site_title TEXT,
    site_subtitle TEXT,
    posts_per_page INT NOT NULL,
    img_url TEXT 
)`, insertData);


function insertData() {
    db.run(`
        INSERT INTO panel_pages (id, title, subtitle) 
        SELECT "panel-main","General Settings","Welcome to General settings, here you can tweak different settings to suit your need"
        WHERE NOT EXISTS(SELECT 1 FROM panel_pages WHERE id = 'panel-main')`);

    db.run(`
        INSERT INTO panel_pages (id, title, subtitle) 
        SELECT "panel-posts","Posts","Here you can manage your posts"
        WHERE NOT EXISTS(SELECT 1 FROM panel_pages WHERE id = 'panel-posts')`);

    db.run(`
        INSERT INTO panel_pages (id, title, subtitle) 
        SELECT "panel-pages","Pages","Here you can manage your pages"
        WHERE NOT EXISTS(SELECT 1 FROM panel_pages WHERE id = 'panel-pages')`);

    db.run(`
        INSERT INTO panel_pages (id, title, subtitle) 
        SELECT "panel-contacts","Contacts","Here you can manage your contacts"
        WHERE NOT EXISTS(SELECT 1 FROM panel_pages WHERE id = 'panel-contacts')`);


    db.run(`
        INSERT INTO general_settings (id, site_title, site_subtitle,posts_per_page ,img_url) 
        SELECT "master","Dejan Arsenijevic","A river cuts trough a rock, not because of its power but its presistence",3,'https://media-exp1.licdn.com/dms/image/C561BAQE7MVqDpP_Gxg/company-background_10000/0/1556621459534?e=2159024400&v=beta&t=ouGkWQ6kxmWDsDdK9Sik57UjuW1Z-tkY9j_yV7Lxsp4'
        WHERE NOT EXISTS(SELECT 1 FROM general_settings WHERE id = 'master')`);

}



//db.run(`INSERT INTO general(siteTitle) VALUES('the Site Title !' )`); 


exports.getSiteTitles = function(id, callback) {
    const query = "SELECT * FROM panel_pages WHERE id = ?";
    const values = [id]
    db.get(query, values, function(error, titles) {
        callback(error, titles)
    });

};

exports.getGeneralSettings = function(callback) {
    const query = "SELECT * FROM general_settings"

    db.get(query, function(error, settings) {
        callback(error, settings)
    });

};














exports.setSiteTitle = function(siteTitle, callback) {
    const query = "UPDATE general SET siteTitle VALUE ?"
    const values = [siteTitle];

    db.run(query, values, function(error) {

        callback(error);

    });
};