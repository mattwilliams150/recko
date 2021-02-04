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
                console.log(filename);
                console.log(filenames.length);
                fs.readFile("./articles/" + filename, "utf-8", function(err, content) {
                    if (err) {
                        console.log('Error : Articles : ' + err);
                        res.redirect('/');
                    }

                    let article = JSON.parse(content);

                    articles[count] = {
                        "filename": filename.replace(".json",""),
                        "title": article.title,
                        "heroImagePath": article.heroImagePath,
                        "introText": article.introText.substring(0,100)+"..."
                    };

                    count++
                    if (count === filenames.length) {
                        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
                        res.render('articles', {title: 'Recko', loggedIn: loggedIn, articles: articles});
                    }
                });
            });
        });
    });
};
