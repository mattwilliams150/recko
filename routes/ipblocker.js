
    /*blockip: (req, res) => {
        let host = req.get('host');
        let ip = req.headers['x-forwarded-for'];

        console.log(host);
        console.log(ip);
        console.log(process.env.TESTINGIP);

        if (host != 'localhost:808' && ip != process.env.TESTINGIP) {
            res.end();
        };
    }*/

function blockip(req, res, next) {
    let host = req.get('host');
    let ip = req.headers['x-forwarded-for'];

    console.log(host);
    console.log(ip);
    console.log(process.env.TESTINGIP);

    if (host != 'localhost:8080' && ip != process.env.TESTINGIP) {
        res.end();
    };
}

module.exports = {
    blockip
};
