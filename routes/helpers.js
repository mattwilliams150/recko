var fs = require("fs");
const logger = require("../logger/index.js");

module.exports.articlesThumbnails = function articlesThumbnails(callback) {
  try {
    fs.readdir("./articles/", function (err, filenames) {
      if (err) {
        console.log(err);
        return;
      }

      var articles = [];
      var count = 0;

      filenames.forEach(function (filename) {
        fs.readFile("./articles/" + filename, "utf-8", function (err, content) {
          if (err) {
            console.log("Error : Articles : " + err);
            res.redirect("/");
          }
          try {
            let article = JSON.parse(content);

            articles.push({
              filename: filename.replace(".json", ""),
              title: article.title,
              heroImagePath: article.heroImagePath,
              introText: article.introText.substring(0, 100) + "...",
              publishDate: article.publishDate,
            });
          } catch (err) {
            console.log("Error : Article : (Processing Json)" + err);
          }

          count++;
          if (count === filenames.length) {
            //if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};

            // sort by date
            function compare(a, b) {
              const articleA = a.publishDate;
              const articleB = b.publishDate;
              let comparison = 0;
              if (articleA > articleB) {
                comparison = -1;
              } else if (articleA < articleB) {
                comparison = 1;
              }
              return comparison;
            }
            articles.sort(compare);

            callback(articles);
            //res.render('articles', {title: 'Recko', loggedIn: loggedIn, articles: articles});
          }
        });
      });
    });
  } catch (e) {
    logger.error(e.message);
  }
};

module.exports.pearsons = function pearsons(array1, array2) {
  try {
    var n = array1.length;
    sum1 = array1.reduce((a, b) => a + b);
    sum2 = array2.reduce((a, b) => a + b);
    prod1 = array1.reduce((a, b) => a * b);
    prod2 = array2.reduce((a, b) => a * b);
    var sumprod = 0;
    for (var i = 0; i < array1.length; i++) {
      sumprod += array1[i] * array2[i];
    }
    var sumsq1 = 0.0;
    for (var i = 0; i < array1.length; i++) {
      sumsq1 += array1[i] * array1[i];
    }
    var sumsq2 = 0.0;
    for (var i = 0; i < array2.length; i++) {
      sumsq2 += array2[i] * array2[i];
    }
    var pearsons =
      (n * sumprod - sum1 * sum2) /
      Math.sqrt((n * sumsq1 - sum1 * sum1) * (n * sumsq2 - sum2 * sum2));

    return pearsons;
  } catch (e) {
    logger.error(e.message);
  }
};

module.exports.topn = function pearsons(object, n) {
  try {
    // get top N items from an object. object in form {a: x, b: y} result as an array [a, b]. ordered highest to lowest.
    var array = [];
    for (var a in object) {
      array.push([a, object[a]]);
    }
    array.sort(function (a, b) {
      return b[1] - a[1];
    });
    array = array.slice(0, n);
    var array2 = [];
    for (var b in array) {
      array2.push(array[b][0]);
    }
    return array2;
  } catch (e) {
    logger.error(e.message);
  }
};
