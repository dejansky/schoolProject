const e = require('express');
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

    db.getSiteTitles(id, function(error, titles) {
        if (error) {
            console.log(error)
        } else {
            db.getGeneralSettings(titles, function(error, settings) {
                if (error) {
                    console.log(error)
                } else {
                    const model = {
                        titles,
                        settings
                    }
                    console.log(model)
                    response.render("panel-main.hbs", model)
                }
            })
        }
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
router.get("/panel-pages", function(request, response) {

    const id = "panel-pages"
    db.getSiteTitles(id, function(error, title) {
        if (error) {
            console.log(error)
        } else {
            const model = {
                title,
            }
            response.render("panel-pages.hbs", model);
        }
    });

})

router.get("/panel-contacts", function(request, response) {

    const id = "panel-contacts"
    db.getSiteTitles(id, function(error, title) {
        if (error) {
            console.log(error)
        } else {
            const model = {
                title,
            }
            response.render("panel-contacts.hbs", model);
        }
    });

})


module.exports = router;