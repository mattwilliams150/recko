var fs = require('fs');

module.exports = (app) => {
    app.get('/post/:postName', (req, res, next) => {

        /*fs.readdir("./articles/", function(err, filenames) {
            if (err) {
                console.log(err);
                return;
            }
            filenames.forEach(function(filename) {
                fs.readFile("./articles/" + filename, "utf-8", function(err, content) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(content)
                });
            });
        });*/

        fs.readFile("./articles/" + req.params.postName + ".json", "utf-8", function(err, content)
        {
            if (err) {
                // redirect to listing page
                console.log(err);
            } else {
                var article = JSON.parse(content);
                if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
                res.render('post', {title: 'Recko', loggedIn: loggedIn, article: article});
            }
        });
    });
};
