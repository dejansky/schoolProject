const express = require("express");
const path = require("path");
const expressHandlebars = require("express-handlebars");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const SQLiteStore = require("connect-sqlite3")(expressSession);
const panelRouter = require("./routers/panelRouters");
const db = require("./db");
const csrf = require("csurf");

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(
  expressSession({
    secret: "199b345fb09ff8e01f507dbd1ab557a1",
    saveUninitialized: false,
    resave: false,
    store: new SQLiteStore(),
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

app.engine(
  "hbs",
  expressHandlebars({
    defaultLayout: "main.hbs",
    extname: "hbs",
  })
);

app.use(csrf({ cookie: true }));

const bcrypt = require("bcrypt");

const admin_username = "admin";
const admin_password =
  "$2b$10$SoDdPdKJ/YpNRf6MiZM2fek2nguMLa.4HJPuKbrg.65RoCnovu6Me";

const MINIMUM_TEXT_LENGTH = 2;
const MINIMUM_NAME_LENGTH = 2;

app.all("/*", function (request, response, next) {
  request.app.locals.layout = "main.hbs";
  const site_settings = new Promise((resolve, reject) => {
    const errors = [];
    db.getGlobalTitles(function (error, rows) {
      if (rows) {
        resolve(rows);
      } else {
        reject(error);
      }
    });
  });

  Promise.all([site_settings])
    .then((rows) => {
      request.app.locals.general_settings = rows[0][0];
    })
    .catch((error) => {
      errors.push("Internal server error :( Pleas try again later");
      request.app.locals.error = true;
      request.app.locals.errors = errors;
    });
  next();
});

app.set("view engine", "hbs");

app.use(function (request, response, next) {
  const isLoggedIn = request.session.isLoggedIn;
  response.locals.isLoggedIn = isLoggedIn;
  next();
});

// GET /
app.get("/", function (request, response) {
  errors = [];
  db.getPostsHome(function (error, posts) {
    if (error) {
      console.log(error);
      errors.push("Internal server error :( Pleas try again later");
      const model = {
        error: true,
        errors: errors,
      };
      response.render("home.hbs", model);
    } else {
      const model = {
        posts,
      };
      response.render("home.hbs", model);
    }
  });
});

// GET /project
app.get("/projects", function (request, response) {
  errors = [];
  db.getProjects(function (error, projects) {
    if (error) {
      errors.push("Internal server error :( Pleas try again later");
      const model = {
        error: true,
        errors: errors,
      };

      response.render("projects.hbs", model);
    } else {
      const model = {
        projects,
      };

      response.render("projects.hbs", model);
    }
  });
});

// GET /about
app.get("/about", function (request, response) {
  db.getContactInformation(function (error, contact) {
    errors = [];
    if (error) {
      errors.push("Internal server error :( Pleas try again later");
      const model = {
        error: true,
        errors: errors,
      };

      response.render("about.hbs", model);
    } else {
      const model = {
        contact,
      };

      response.render("about.hbs", model);
    }
  });
});

// GET /contact
app.get("/contact", function (request, response) {
  response.render("contact.hbs");
});

function contactFormValidation(first_name, last_name, email, message) {
  const errors = [];

  if (
    first_name.length < MINIMUM_NAME_LENGTH ||
    last_name.length < MINIMUM_NAME_LENGTH
  ) {
    errors.push(
      "First name and last name must be greater then " +
        MINIMUM_NAME_LENGTH +
        " characters!"
    );
  }
  if (!email.includes("@")) {
    errors.push("Invalid email");
  }
  if (message.length < MINIMUM_TEXT_LENGTH) {
    errors.push("Message must be greater then " + MINIMUM_TEXT_LENGTH + "!");
  }

  return errors;
}

app.post("/contact", function (request, response) {
  const first_name = request.body.first_name;
  const last_name = request.body.last_name;
  const email = request.body.email;
  const message = request.body.message;

  const errors = contactFormValidation(first_name, last_name, email, message);

  if (errors.length > 0) {
    const model = {
      errors: errors,
      first_name: first_name,
      last_name: last_name,
      email: email,
      message: message,
    };

    response.render("contact.hbs", model);
  } else {
    db.sendMessage(first_name, last_name, email, message, function (error) {
      if (error) {
        errors.push("Internal server error :( Please try again later) ");
        const model = {
          error: true,
          errors: errors,
        };

        response.render("contact.hbs", model);
      } else {
        const model = {
          success: true,
        };

        response.render("contact.hbs", model);
      }
    });
  }
});

// GET /login
app.get("/login", function (request, response) {
  const model = {
    csrfToken: request.csrfToken(),
  };
  response.render("login.hbs", model);
});

app.post("/login", function (request, response) {
  const entered_username = request.body.entered_username;
  const entered_password = request.body.entered_password;

  const errors = [];

  console.log("ENTERED !! ", entered_username, entered_password);

  if (
    entered_username == admin_username &&
    bcrypt.compareSync(entered_password, admin_password) == true
  ) {
    request.session.isLoggedIn = true;
    response.redirect("/panel/");
  } else {
    //display erorr message wrong password or username
    errors.push("The username or password is incorrect");
    const model = {
      errors: errors,
    };
    response.render("login.hbs", model);
  }
});

app.post("/logout", function (request, response) {
  request.session.isLoggedIn = false;
  response.redirect("/");
});

app.use(csrf({ cookie: true }));

app.use(function (request, response, next) {
  const token = request.csrfToken();
  response.cookie("XSRF-TOKEN", token);
  response.app.locals.csrfToken = token;
  next();
});

app.use("/panel", panelRouter);

app.listen(3000);
