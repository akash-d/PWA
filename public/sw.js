importScripts('/javascripts/idb.js');
importScripts('/javascripts/utility.js');

var CACHE_STATIC_NAME = 'static-v40';
var CACHE_DYNAMIC_NAME = 'dynamic-v3';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/about.html',
    '/contact.html',
    '/error.html',
    '/services.html',
    '/work.html',
    '/stylesheets/animate.css',
    '/stylesheets/bootstrap.css',
    '/stylesheets/icomoon.css',
    '/stylesheets/owl.carousel.min.css',
    '/stylesheets/owl.theme.default.min.css',
    '/stylesheets/style.css',
    '/javascripts/bootstrap.min.js',
    '/javascripts/fetch.js',
    '/javascripts/idb.js',
    '/javascripts/jquery.min.js',
    '/javascripts/jquery.easing.1.3.js',
    '/javascripts/jquery.stellar.min.js',
    '/javascripts/jquery.waypoints.min.js',
    '/javascripts/main.js',
    '/javascripts/modernizr-2.6.2.min.js',
    '/javascripts/owl.carousel.min.js',
    '/javascripts/promise.js',
    '/javascripts/respond.min.js',
    '/javascripts/service-worker-registeration.js',
    '/javascripts/utility.js',
    '/fonts/bootstrap/glyphicons-halflings-regular.eot',
    '/fonts/bootstrap/glyphicons-halflings-regular.svg',
    '/fonts/bootstrap/glyphicons-halflings-regular.ttf',
    '/fonts/bootstrap/glyphicons-halflings-regular.woff',
    '/fonts/bootstrap/glyphicons-halflings-regular.woff2',
    '/fonts/icomoon/icomoon.eot',
    '/fonts/icomoon/icomoon.svg',
    '/fonts/icomoon/icomoon.ttf',
    '/fonts/icomoon/icomoon.woff',
    '/images/img_bg_1.jpg',
    '/images/img_bg_2.jpg',
    '/images/iphone.png',
    '/images/loader.gif',
    '/images/person_1.jpg',
    '/images/person_2.jpg',
    '/images/person_3.jpg',
    '/images/project-1.jpg',
    '/images/project-2.jpg',
    '/images/project-3.jpg',
    '/images/project-4.jpg',
    '/images/project-5.jpg',
    '/images/project-6.jpg',
    '/images/project-7.jpg',
    '/images/project-8.jpg',
    'https://fonts.googleapis.com/css?family=Work+Sans:300,400,500,700,800'
];

function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
        .then(function(cache) {
            return cache.keys()
                .then(function(keys) {
                    if (keys.length > maxItems) {
                        cache.delete(keys[0])
                            .then(trimCache(cacheName, maxItems));
                    }
                });
        })
}

self.addEventListener('install', function(event) {
    console.log('**Log from inside service worker** Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
        .then(function(cache) {
            console.log('**Log from inside service worker** Precaching App Shell');
            cache.addAll(STATIC_FILES);
        })
    )
});

self.addEventListener('activate', function(event) {
    console.log('**Log from inside service worker** Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys()
        .then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                    console.log('**Log from inside service worker** Removing old cache.', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function(event) {

    var url = '/api/modules';
    if (event.request.url.indexOf(url) !== -1 && event.request.method === 'GET') {
        event.respondWith(fetch(event.request)
            .then(function(res) {
                var clonedRes = res.clone();
                // clear all existing data from modules table in our index db
                clearAllData('modules')
                    .then(function() {
                        return clonedRes.json();
                    })
                    .then(function(data) {
                        for (var key in data) {
                            writeData('posts', data[key])
                        }
                    });
                return res;
            })
        );
    } else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then(function(res) {
                            return caches.open(CACHE_DYNAMIC_NAME)
                                .then(function(cache) {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        })
                        .catch(function(err) {
                            return caches.open(CACHE_STATIC_NAME)
                                .then(function(cache) {
                                    if (event.request.headers.get('accept').includes('text/html')) {
                                        return cache.match('/offline.html');
                                    }
                                });
                        });
                }
            })
        );
    }
});









/**
 * Bacground sync
 */
self.addEventListener('sync', function(event) {
    console.log('**Log from inside service worker** Background syncing', event);
    if (event.tag === 'background-sync') {
        console.log('**Log from inside service worker** Syncing new modules');
        event.waitUntil(
            readAllData('sync-modules')
            .then(function(data) {
                for (var dt of data) {
                    var postData = {
                        id: dt.id,
                        name: dt.name,
                        meta: dt.meta
                    };
                    fetch('/apis/post-modules', {
                            method: 'POST',
                            headers: new Headers({
                                'Content-Type': 'application/json',
                                'accepts': 'application/json'
                            }),
                            body: JSON.stringify(postData)
                        })
                        .then(function(res) {
                            console.log('Sent data', res);
                            if (res.ok) {
                                res.json()
                                    .then(function(resData) {
                                        clearAllData('sync-modules');
                                    });
                            }
                        })
                        .catch(function(err) {
                            console.log('Error while sending data', err);
                        });
                }

            })
        );
    }
});
/**
 * When notification is clicked
 */
self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    var action = event.action;

    console.log(notification);

    if (action === 'confirm') {
        console.log('Confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        event.waitUntil(
            /**
             * clients.matchAll() returns a Promise that 
             * resolves with all the clients controlled by this service worker
             */
            /**
             * The WindowClient interface of the ServiceWorker API
             *  represents the scope of a service worker client that
             *  is a document in a browser context, controlled by an
             *  active worker. The service worker client independently
             *  selects and uses a service worker for its own loading
             *  and sub-resources.
             * The Client interface represents an executable context 
             * such as a Worker, or a SharedWorker. Window clients are
             *  represented by the more-specific WindowClient. You can
             *  get Client/WindowClient objects from methods such as
             *  Clients.matchAll() and Clients.get().
             * The Clients interface provides access to Client objects.
             *  Access it via self.clients within a service worker.
             */
            clients.matchAll()
            .then(function(clis) {
                /**
                 * Find returns first of the guys who satisfy the condition
                 * i.e. for which we return true.
                 */
                var client = clis.find(function(c) {
                    return c.visibilityState === 'visible';
                });

                if (client !== undefined) {
                    client.navigate(notification.data.url);
                    client.focus();
                } else {
                    clients.openWindow(notification.data.url);
                }
                notification.close();
            })
        );
    }
});
/**
 * When some notification is closed
 */
self.addEventListener('notificationclose', function(event) {
    console.log('Notification was closed', event);
});

/**
 * handle push notification
 */
self.addEventListener('push', function(event) {
    console.log('Push Notification received', event);

    var data = { title: 'New!', content: 'Something new happened!', openUrl: '/' };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.content,
        icon: '/images/icons/app-icon-96x96.png',
        badge: '/images/icons/app-icon-96x96.png',
        data: {
            url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});