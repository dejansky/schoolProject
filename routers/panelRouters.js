const express = require('express');
const db = require('../db');

const router = express.Router();

router.all('/*', function(request, response, next) {
    request.app.locals.layout = 'panel.hbs';
    next();
})

router.get("/", function(request, response) {

    response.render('panel-main.hbs');

})


router.get("/panel-main", async function(request, response) {
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


        setTimeout(() => {
            const model = {
                titles: m[0],
                site_settings: m[1]
            }

            console.log(model)

            response.render("panel-main.hbs", model)
        }, 1000);

    })

})


router.get("/panel-posts", function(request, response) {

    const id = "panel-posts"
    db.getSiteTitles(id, function(error, title) {
        if (error) {
            console.log(error)
        } else {
            const model = {
                title,
            }
            response.render("panel-posts.hbs", model);
        }
    });

})
router.get("/panel-projects", function(request, response) {

    const id = "panel-projects"
    db.getSiteTitles(id, function(error, title) {
        if (error) {
            console.log(error)
        } else {
            const model = {
                title,
            }
            response.render("panel-projects.hbs", model);
        }
    });

})

router.get("/panel-messages", function(request, response) {

    const id = "panel-messages"
    db.getSiteTitles(id, function(error, title) {
        if (error) {
            console.log(error)
        } else {
            const model = {
                title,
            }
            response.render("panel-messages.hbs", model);
        }
    });

})


module.exports = router;