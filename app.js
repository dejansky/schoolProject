const express = require('express');
const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const SQLiteStore = require('connect-sqlite3')(expressSession);
const panelRouter = require('./routers/panelRouters');
const db = require('./db');
const e = require('express');

const app = express();


app.use(cookieParser())
app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: false,

}));


app.use(expressSession({
    secret: "199b345fb09ff8e01f507dbd1ab557a1",
    saveUninitialized: false,
    resave: false,
    store: new SQLiteStore()
}));



app.engine("hbs", expressHandlebars({
    defaultLayout: "main.hbs"
}));

app.all('/*', function(request, response, next) {
    request.app.locals.layout = 'main.hbs';
    next();
})

app.set('view engine', 'hbs');

// GET /
app.get("/", function(request, response) {
    db.getPosts(function(error, posts) {
        if (error) {

        } else {
            const model = {
                posts,
            }
            console.log(model)
            response.render("home.hbs", model)
        }

    })
});

// GET /project
app.get("/projects", function(request, response) {
    db.getProjects(function(error, projects) {
        if (error) {

        } else {
            const model = {
                projects,
            }
            response.render("projects.hbs", model)
        }
    })
});

// GET /about
app.get("/about", function(request, response) {
    db.getContactInformation(function(error, contact) {
        if (error) {

        } else {
            const model = {
                contact,
            }
            console.log(model)
            response.render("about.hbs", model)
        }
    })

});

// GET /contact
app.get("/contact", function(request, response) {
    response.render("contact.hbs")
});

app.post("/contact", function(request, response) {

    const first_name = request.body.first_name
    const last_name = request.body.last_name
    const email = request.body.email
    const message = request.body.message

    const values = [
        first_name,
        last_name,
        email,
        message
    ]
    db.sendMessage(values, function(error) {
        if (error) {
            console.log(error)
        } else {
            console.log("Sucess")
            response.redirect("/")
        }
    })
})

// GET /login
app.get("/login", function(request, response) {
    response.render("login.hbs")
});

app.get("/register", function(request, response) {
    response.render("register.hbs")
});

// app.get("/page", function(request, response) {
//     response.render("page.hbs")
// });

app.use("/panel", panelRouter);


app.listen(8080);