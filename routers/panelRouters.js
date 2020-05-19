const express = require('express');
const db = require('../db');

const router = express.Router();

router.all('/*', function(request,response,next){
    request.app.locals.layout = 'panel.hbs';
    next(); 
})

router.get("/" ,function(request,response){

    response.render('panel-main.hbs');
    
})

router.get("/panel-main" ,function(request,response){

    db.getSiteTitle(function(error, general) {

        const model = {
            general
        }
        response.render("panel-main.hbs", model)
    });
    
})
router.get("/panel-posts" ,function(request,response){

    db.getSiteTitle(function(error, general) {

        const model = {
            general
        }
        response.render("panel-posts.hbs", model)
    });
    
})
router.get("/panel-pages" ,function(request,response){

    db.getSiteTitle(function(error, general) {

        const model = {
            general
        }
        response.render("panel-pages.hbs", model)
    });
    
})
router.get("/panel-media" ,function(request,response){

    db.getSiteTitle(function(error, general) {

        const model = {
            general
        }
        response.render("panel-media.hbs", model)
    });
    
})


module.exports = router;