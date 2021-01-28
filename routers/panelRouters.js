const { response } = require('express');
const express = require('express');
const db = require('../db');

const router = express.Router();

router.all('/*', function(request, response, next) {
    request.app.locals.layout = 'panel.hbs';
    next();
})

router.get("/", function(request, response) {

    response.redirect('/panel/panel-main');

})


router.get("/panel-main", function(request, response) {
    const id = "panel-main"


    const titles = new Promise((resolve, reject) => {
        db.getSiteTitles(id, function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    const site_settings = new Promise((resolve, reject) => {
        db.getGeneralSettings(function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    Promise.all([titles, site_settings]).then((m) => {
        const model = {
            titles: m[0],
            site_settings: m[1]
        }
        console.log(model)
        response.render("panel-main.hbs", model)

    })

})

router.post("/panel-main/update", function(request, response) {

    const site_title = request.body.site_title
    const site_subtitle = request.body.site_subtitle
    const posts_per_page = request.body.posts_per_page
    const img_url = request.body.img_url
    const global_email = request.body.global_email
    const global_name = request.body.global_name
    const about = request.body.about

    const values = [
        site_title,
        site_subtitle,
        posts_per_page,
        img_url,
        global_email,
        global_name,
        about
    ]

    console.log(values)

    db.updateGeneralSettings(values, function(error) {
        if (error) {
            console.log(error)
        } else {
            console.log("sucess")
            response.redirect("/panel/")
        }
    })
})


router.get("/panel-posts", function(request, response) {

    const id = "panel-posts"
    const titles = new Promise((resolve, reject) => {
        db.getSiteTitles(id, function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    const posts = new Promise((resolve, reject) => {
        db.getPosts(function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    Promise.all([titles, posts]).then((m) => {
        const model = {
            titles: m[0],
            posts: m[1]
        }
        console.log(model)
        response.render("panel-posts.hbs", model)

    })
})

router.post("/panel-posts/create", function(request, response) {
    const post_title = request.body.create_post_title
    const post_content = request.body.create_post_content
    const post_type = "post"
    const values = [
        post_type,
        post_title,
        post_content,
    ]

    console.log(values)

    db.createPost(values, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/panel/panel-posts")
        }
    })
})

router.post("/panel-posts/update", function(request, response) {
    const post_title = request.body.post_title
    const post_content = request.body.post_content
    const p_id = request.body.post_id

    const values = [
        post_title,
        post_content,
        p_id
    ]

    db.updatePost(values, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/panel/panel-posts")
        }
    })
})

router.post("/panel-posts/delete", function(request, response) {
    const p_id = request.body.post_id

    const values = [
        p_id
    ]

    db.deletePost(values, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/")
        }
    })
})

router.post("/panel-projects/create", function(request, response) {
    const post_title = request.body.project_title
    const project_thumbnail = request.body.project_thumbnail
    const project_link = request.body.project_link
    const post_content = request.body.project_content

    db.createProject(post_title, post_content, project_thumbnail, project_link, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/panel/panel-projects")
        }
    })
})


router.get("/panel-projects", function(request, response) {
    const id = "panel-projects"

    const titles = new Promise((resolve, reject) => {
        db.getSiteTitles(id, function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    const projects = new Promise((resolve, reject) => {
        db.getProjects(function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    Promise.all([titles, projects]).then((m) => {
        const model = {
            titles: m[0],
            projects: m[1]
        }
        console.log(model)
        response.render("panel-projects.hbs", model)

    })
})

router.post("/panel-projects/update", function(request, response) {
    const post_title = request.body.project_title
    const project_thumbnail = request.body.project_thumbnail
    const project_link = request.body.project_link
    const post_content = request.body.project_content
    const the_id = request.body.post_id

    db.updateProject(the_id, post_title, post_content, project_thumbnail, project_link, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/panel/panel-projects")
        }
    })
})

router.post("/panel-projects/delete", function(request, response) {
    const the_id = request.body.post_id

    console.log(the_id)
    db.deleteProject(the_id, function(error) {
        if (error) {
            console.log(error)
        } else {
            response.redirect("/panel/panel-projects")
        }
    })
})




router.get("/panel-messages", function(request, response) {

    const id = "panel-messages"
    const titles = new Promise((resolve, reject) => {
        db.getSiteTitles(id, function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    const guest_messages = new Promise((resolve, reject) => {
        db.getMessages(function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    Promise.all([titles, guest_messages]).then((m) => {
        const model = {
            titles: m[0],
            guest_messages: m[1]
        }
        console.log(model)
        response.render("panel-messages.hbs", model)

    })


})

router.post("/panel-messages", function(request, response) {

    const id = request.body.message_id
    const values = [
        id
    ]

    console.log(values)

    db.deleteMessage(values, function(error) {
        if (error) {
            console.log(error)
        } else {
            console.log("sucess")
            response.redirect("/panel/")
        }
    })

})



module.exports = router;