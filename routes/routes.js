var locations = require("../config/locations.json");
var helpers = require("./helpers");
var Newsletter = require("../models/newsletter");
var categories = require("../config/categories.json");
const logger = require("../logger/index.js");

module.exports = (app) => {
  try {
    app.get("/", (req, res, next) => {
      helpers.articlesThumbnails(function (articles) {
        if (req.user !== undefined) {
          loggedIn = true;
        } else {
          loggedIn = false;
        }
        var emailMessage = req.flash("emailMessage");
        res.render("index", {
          title: "Recko",
          loggedIn: loggedIn,
          locations: locations,
          articles: articles,
          emailMessage: emailMessage,
          categories: categories,
            datalayer: {
                page: "homepage",
				loginStatus: loggedIn
            }
        });
      });
    });

    app.post("/newsletter", (req, res) => {
      var newNewsletter = new Newsletter();
      newNewsletter.email = req.body.email;
      console.log("here" + req.body.email);
      newNewsletter.save((err) => {
        console.log(err);
      });

      req.flash(
        "emailMessage",
        "Woohoo you’ve joined the relevance revolution! We will be in touch once Recko is live!"
      );
      res.redirect("/");
    });
  } catch (e) {
    logger.error(e.message);
  }
};
