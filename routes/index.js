var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
var STATIC_MAPPINGS = {
    '/about': 'about',
    '/contact': 'contact',
    '/index': 'index',
    '/services': 'services',
    '/work': 'work',
    '/error': 'error'
}
var STATIC_ROUTES = ['/about', '/contact', '/index.html', '/services', '/work', '/error'];

router.get(STATIC_ROUTES[0], function(req, res) {
    res.render(STATIC_MAPPINGS[STATIC_ROUTES[0]]);
});
router.get(STATIC_ROUTES[1], function(req, res) {
    res.render(STATIC_MAPPINGS[STATIC_ROUTES[1]]);
});
router.get(STATIC_ROUTES[2], function(req, res) {
    res.render(STATIC_MAPPINGS[STATIC_ROUTES[2]]);
});
router.get(STATIC_ROUTES[3], function(req, res) {
    res.render(STATIC_MAPPINGS[STATIC_ROUTES[3]]);
});
router.get(STATIC_ROUTES[4], function(req, res) {
    res.render(STATIC_MAPPINGS[STATIC_ROUTES[4]]);
});
router.get(STATIC_ROUTES[5], function(req, res) {
    res.render(STATIC_MAPPINGS[STATIC_ROUTES[5]]);
});

module.exports = router;