var fs = require('fs');

module.exports.articlesThumbnails =
    function articlesThumbnails(callback) {
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
    };
