var fs = require('fs');

module.exports = (app) => {
    app.get('/post/:postName', (req, res, next) => {

        fs.readFile("./articles/" + req.params.postName + ".json", "utf-8", function(err, content)
        {
            if (err) {
                console.log('Error : Post : ' + err);
                res.redirect('/articles/');
            } else {
                var article = JSON.parse(content);
                if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
                res.render('post', {title: 'Recko', loggedIn: loggedIn, article: article});
            }
        });
    });

    app.get('/articles/', (req, res, next) => {

        fs.readdir("./articles/", function(err, filenames) {
            if (err) {
                console.log(err);
                return;
            }

            var articles = [];
            var count = 0;

            filenames.forEach(function(filename) {
                fs.readFile("./articles/" + filename, "utf-8", function(err, content) {
                    if (err) {
                        console.log('Error : Articles : ' + err);
                        res.redirect('/');
                    }
                    try {
                        let article = JSON.parse(content);

                        articles.push({
                            "filename": filename.replace(".json",""),
                            "title": article.title,
                            "heroImagePath": article.heroImagePath,
                            "introText": article.introText.substring(0,100)+"...",
                            "publishDate": article.publishDate
                        });

                    }
                    catch(err) {
                        console.log('Error : Article : (Processing Json)' + err);
                    }

                    count++
                    if (count === filenames.length) {
                        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
                        console.log(articles);
                        // sort by date
                        function compare(a, b) {
                          // Use toUpperCase() to ignore character casing
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
                        console.log(articles);
                        res.render('articles', {title: 'Recko', loggedIn: loggedIn, articles: articles});
                    }
                });
            });
        });
    });
};
