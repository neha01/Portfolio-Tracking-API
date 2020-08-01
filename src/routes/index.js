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
    })
}

module.exports = init;