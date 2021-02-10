const { query } = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('database.db');

db.run("PRAGMA foreign_keys=ON");


db.run(`CREATE TABLE IF NOT EXISTS panel_pages(
    id TEXT PRIMARY KEY UNIQUE,
    title TEXT,
    subtitle TEXT)`, function() {
    insert_into_panel_pages()
});

db.run(`CREATE TABLE IF NOT EXISTS general_settings (
    id TEXT PRIMARY KEY UNIQUE,
    site_title TEXT,
    site_subtitle TEXT,
    posts_per_page INT NOT NULL,
    img_url TEXT,
    profile_img_url TEXT,   
    global_email TEXT,
    global_name TEXT,
    about TEXT
)`, function() {
    insert_into_general_settings()
});

db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_type TEXT,
    author FOREIGNKEY TEXT,
    publish_date DATE,
    post_title TEXT,
    post_content TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS projects (
    project_thumbnail TEXT,
    project_link TEXT,
    id INTEGER,
    CONSTRAINT fk_id
        FOREIGN KEY (id)
        REFERENCES posts(id)
        ON DELETE CASCADE
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY UNIQUE,
    first_name TEXT,
    last_name TEXT,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
)`);


function insert_into_panel_pages() {
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
        SELECT "panel-projects","Projects","Here you can manage your pages"
        WHERE NOT EXISTS(SELECT 1 FROM panel_pages WHERE id = 'panel-projects')`);

    db.run(`
        INSERT INTO panel_pages (id, title, subtitle) 
        SELECT "panel-messages","Messages","Here you can manage your messages"
        WHERE NOT EXISTS(SELECT 1 FROM panel_pages WHERE id = 'panel-messages')`);

}

function insert_into_general_settings() {
    db.run(`
        INSERT INTO general_settings (id, site_title, site_subtitle,posts_per_page ,img_url,profile_img_url, global_email, global_name, about) 
        SELECT "master","Dejan Arsenijevic","A river cuts trough a rock, not because of its power but its presistence",3,'https://echangesinternationaux.hec.ca/wp-content/uploads/2016/06/jonko-1205x800.jpg','images/profile_about.jpg','dejanarsen@gmail.com','Dejan Arsenijevic', 'Something about you'
        WHERE NOT EXISTS(SELECT 1 FROM general_settings WHERE id = 'master')`);

}

function insert_into_posts() {
    db.run(`
        INSERT INTO posts (post_type, publish_date ,post_title, post_content) 
        VALUES ('project',02-02-20002,'My first post','Some text') `);

}


exports.getSiteTitles = function(id, callback) {
    const query = "SELECT * FROM panel_pages WHERE id = ?";
    const values = [id]
    db.get(query, values, function(error, rows) {
        callback(error, rows)
    });

};

exports.getGeneralSettings = function(callback) {
    const query = "SELECT * FROM general_settings"

    db.all(query, function(error, rows) {
        callback(error, rows)
    });

};

exports.updateGeneralSettings = function(site_title, site_subtitle, posts_per_page, profile_img_url, img_url, global_email, global_name, about, callback) {
    const query = `
    UPDATE 
        general_settings
    SET
        site_title = ?,
        site_subtitle = ?,
        posts_per_page = ?,
        img_url = ?,
        profile_img_url = ?,    
        global_email = ?,
        global_name = ?,
        about = ?
    `
    const values = [
        site_title,
        site_subtitle,
        posts_per_page,
        img_url,
        profile_img_url,
        global_email,
        global_name,
        about
    ]

    console.log(values)

    db.run(query, values, function(error) {
        callback(error)
    });

};

exports.getContactInformation = function(callback) {
    const query = "SELECT global_name,global_email,profile_img_url,about FROM general_settings"

    db.get(query, function(error, rows) {
        callback(error, rows)
    });

}

exports.getPosts = function(callback) {
    const query = "SELECT * FROM posts WHERE post_type = ? ORDER BY id DESC"
    const values = ["post"]

    db.all(query, values, function(error, rows) {
        callback(error, rows)
    })
}

exports.createPost = function(post_content, post_title, callback) {
    const query = `INSERT INTO posts (post_type, post_title, post_content)
    VALUES (?,?,?) `

    const post_type = "post"

    values = [
        post_type,
        post_title,
        post_content
    ]

    db.run(query, values, function(error) {
        callback(error)
    })
}

exports.updatePost = function(post_title, post_content, p_id, callback) {
    const query = `
    UPDATE posts
    SET
    post_title = ?,
    post_content = ?
    WHERE 
    id = ?
    AND 
    post_type = ?
    `
    const post_type = "post"

    const values = [
        post_title,
        post_content,
        p_id,
        post_type
    ]

    db.run(query, values, function(error) {
        callback(error)
    })
}

exports.deletePost = function(p_id, callback) {

    const query = `
    DELETE FROM posts
    WHERE
    id = ?
    AND 
    post_type = ?
    `
    const post_type = "post"

    const values = [
        p_id,
        post_type
    ]
    db.run(query, values, function(error) {
        callback(error)
    })
}

exports.createProject = function(post_title, post_content, project_thumbnail, project_link, callback) {
    const queryOne = `
    INSERT INTO posts (post_type, post_title, post_content)
    VALUES (?,?,?)`

    const post_type = "project"

    const valuesOne = [
        post_type,
        post_title,
        post_content
    ]

    const queryTwo = `
    INSERT INTO projects (id, project_thumbnail, project_link)
    VALUES (last_insert_rowid(),?,?)
    `

    const valuesTwo = [
        project_thumbnail,
        project_link
    ]
    db.run(queryOne, valuesOne, function(error) {
        db.run(queryTwo, valuesTwo, function(error) {
            callback(error)
        })
    })
}


exports.getProjects = function(callback) {
    const query = `SELECT * FROM projects 
    LEFT JOIN posts ON projects.id = posts.id
    WHERE posts.post_type = ?
    ORDER BY 
    id DESC`

    const values = ["project"]

    db.all(query, values, function(error, rows) {
        callback(error, rows)
    })
}


exports.updateProject = function(the_id, post_title, post_content, project_thumbnail, project_link, callback) {
    const queryOne = `
    UPDATE posts
    SET
    post_title = ?,
    post_content = ?
    WHERE 
    id = ?`

    const post_type = "project"

    const valuesOne = [
        post_title,
        post_content,
        the_id
    ]

    const queryTwo = `UPDATE projects
    SET
    project_thumbnail = ?,
    project_link = ?
    WHERE 
    id = ?
    `

    const valuesTwo = [
        project_thumbnail,
        project_link,
        the_id
    ]
    db.run(queryOne, valuesOne, function(error) {
        db.run(queryTwo, valuesTwo, function(error) {
            callback(error)
        })
    })
}


exports.deleteProject = function(the_id, callback) {
    const query = `DELETE FROM posts
    WHERE id = ?`



    const values = [the_id]

    db.run(query, values, function(error) {
        callback(error)
    })
}


exports.getMessages = function(callback) {
    const query = "SELECT * FROM messages ORDER BY id DESC"

    db.all(query, function(error, rows) {
        callback(error, rows)
    })
}

exports.deleteMessage = function(message_id, callback) {
    const values = [
        message_id
    ]
    const query = "DELETE FROM messages WHERE id = ?"

    db.all(query, values, function(error) {
        callback(error)
    })
}

exports.sendMessage = function(first_name, last_name, email, message, callback) {
    const query = `INSERT INTO messages(first_name, last_name, email, message) 
    VALUES(?,?,?,?)`

    const values = [
        first_name,
        last_name,
        email,
        message
    ]

    db.run(query, values, function(error) {
        callback(error)
    })

}