var express = require('express');
var router = express.Router();
var modules = [{
    id: 'first module',
    'name': 'Awesome PWA app built',
    'meta': 'Hopefully this app will make you understand everything'
}];
var webpush = require("web-push");
var pushSubscriptions = [];
var webPushPublicKey = "BOUGSDXrCr9hl_kjNsDAcZvtMZHwm6GOAgOtERPNJX59Sg9D81n8YtRIxFQcAK8eYpvVV5_YrVH1m-_dofioIFw";
var webPushPrivateKey = 'YA2NQ5ujDzQusBRlIjwAn9kqtP3HMhN4JON6L6Mqa3s';
router.post('/post-modules', function(req, res, next) {
    modules.push(req.body);
    res.json({
        msg: 'created Sucessfully',
        statusCode: 200
    });
});

router.get('/modules', function(req, res, next) {
    res.json(modules);
});

router.post('/store-subscriptions', function(req, res, next) {
    pushSubscriptions.push(req.body);
    res.json({
        msg: 'created Sucessfully',
        statusCode: 200
    });
});
router.get('/get-subscriptions', function(req, res, next) {
    res.json(pushSubscriptions);
});
router.get('/send-notification', function(req, res) {
    webpush.setVapidDetails(
        "mailto:soumitrarock@gmail.com",
        webPushPublicKey,
        webPushPrivateKey
    );
    pushSubscriptions.forEach(function(sub) {
        var pushConfig = {
            endpoint: sub.endpoint,
            keys: {
                auth: sub.keys.auth,
                p256dh: sub.keys.p256dh
            }
        };

        webpush.sendNotification(
            pushConfig,
            JSON.stringify({
                title: "Hello Guys",
                content: "Welcome to intro to PWA!",
                openUrl: "/"
            })
        ).catch(function(err) {
            console.log(err);
        });
    })
    res.json({
        msg: 'success',
        statusCode: 200
    })
})

module.exports = router;