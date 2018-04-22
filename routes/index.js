var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
var STATIC_MAPPINGS = {
    '/about.html': 'about',
    '/contact.html': 'contact',
    '/index.html': 'index',
    '/services.html': 'services',
    '/work.html': 'work',
    '/error.html': 'error'
}
var STATIC_ROUTES = ['/about.html', '/contact.html', '/index.html', '/services.html', '/work.html', '/error.html'];
for (var route in STATIC_ROUTES) {
    router.get(STATIC_ROUTES[route], function(req, res) {
        res.render(STATIC_MAPPINGS[STATIC_ROUTES[route]]);
    })
}
module.exports = router;