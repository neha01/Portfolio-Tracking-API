const path = require('path');
const routes = [
    {
        fileName: 'portfolio',
        mount: '/'
    }, {
        fileName: 'trade',
        mount: '/'
    }
]
function init(app) {
    routes.forEach(route => {
        const routePath = path.resolve(__dirname, `./${route.fileName}`);
        app.use(route.mount, require(routePath));
    });
    app.use('/', (req, res) => {
        res.write('<h1>Welcome to Portfolio Tracking API<h1>');
        res.write('<h2>Available routes and all the documentaion can be found at:<h2>');
        res.write('<a href="https://github.com/neha01/Portfolio-Tracking-API"> Github - Portfolio Tracking API</a>');
        res.end();
    })
}

module.exports = init;