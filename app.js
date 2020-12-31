const express = require('express');
const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const SQLiteStore = require('connect-sqlite3')(expressSession);
const panelRouter = require('./routers/panelRouters');


const app = express();


app.use(cookieParser())
app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: false,

}));


app.use(expressSession({
    secret: "something",
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
    response.render("home.hbs")
});

// GET /project
app.get("/project", function(request, response) {
    response.render("project.hbs")
});

// GET /about
app.get("/about", function(request, response) {
    response.render("about.hbs")
});

// GET /contact
app.get("/contact", function(request, response) {
    response.render("contact.hbs")
});

// GET /login
app.get("/login", function(request, response) {
    response.render("login.hbs")
});

app.get("/register", function(request, response) {
    response.render("register.hbs")
});

app.get("/page", function(request, response) {
    response.render("page.hbs")
});

app.use("/panel", panelRouter);


app.listen(8080);