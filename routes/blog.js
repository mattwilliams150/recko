var fs = require("fs");
var helpers = require("./helpers");
var categories = require("../config/categories.json");
const logger = require("../logger/index.js");

module.exports = function (app) {
  try {
    app.get("/post/:postName", (req, res, next) => {
      fs.readFile(
        "./articles/" + req.params.postName + ".json",
        "utf-8",
        function (err, content) {
          if (err) {
            console.log("Error : Post : " + err);
            res.redirect("/articles/");
          } else {
            var article = JSON.parse(content);
            if (req.user !== undefined) {
              loggedIn = true;
            } else {
              loggedIn = false;
            }
            res.render("post", {
              title: "Recko",
              loggedIn: loggedIn,
              article: article,
              categories: categories,
            });
          }
        }
      );
    });

    app.get("/articles/", (req, res) => {
      helpers.articlesThumbnails(function (articles) {
        if (req.user !== undefined) {
          loggedIn = true;
        } else {
          loggedIn = false;
        }
        res.render("articles", {
          title: "Recko",
          loggedIn: loggedIn,
          articles: articles,
            categories: categories,
        });
      });
    });
  } catch (e) {
    logger.error(e.message);
  }
};
