/**
 * this variable will store the instance of install prompt
 */
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() {
            console.log('Service worker registered!');
        })
        .catch(function(err) {
            console.log(err);
        });
}
/**
 * this event is fired before the install prompt is shown by the
 * browser, we can control now when to fire it.
 */
window.addEventListener('beforeinstallprompt', function(event) {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        var options = {
            body: 'Yay!!!! Notifications will screw your life now!',
            icon: '/images/icons/app-icon-96x96.png',
            image: '/images/img_bg_1.jpg',
            dir: 'ltr',
            lang: 'en-US', // BCP 47,
            vibrate: [100, 50, 200],
            badge: '/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                { action: 'confirm', title: 'Okay', icon: '/images/icons/app-icon-96x96.png' },
                { action: 'cancel', title: 'Cancel', icon: '/images/icons/app-icon-96x96.png' }
            ]
        };

        navigator.serviceWorker.ready
            .then(function(swreg) {
                swreg.showNotification('Successfully subscribed!', options);
            });
    }
}

function configurePushSub() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    var reg;
    navigator.serviceWorker.ready
        .then(function(swreg) {
            reg = swreg;
            return swreg.pushManager.getSubscription();
        })
        .then(function(sub) {
            if (sub === null) {
                // Create a new subscription
                var vapidPublicKey = 'BOUGSDXrCr9hl_kjNsDAcZvtMZHwm6GOAgOtERPNJX59Sg9D81n8YtRIxFQcAK8eYpvVV5_YrVH1m-_dofioIFw';
                var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                return reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey
                });
            } else {
                // We have a subscription
            }
        })
        .then(function(newSub) {
            return fetch('/apis/store-subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            })
        })
        .then(function(res) {
            if (res.ok) {
                displayConfirmNotification();
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

function askForNotificationPermission() {
    Notification.requestPermission(function(result) {
        console.log('User Choice', result);
        if (result !== 'granted') {
            console.log('No notification permission granted!');
        } else {
            configurePushSub();
        }
    });
}


for (var i = 0; i < enableNotificationsButtons.length; i++) {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    } else {
        enableNotificationsButtons[i].addEventListener('click', function() {
            alert('oh no, notifications are not supported');
        });
    }

}

var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
        resolve();
    }, 30000);
});


if ('serviceWorker' in navigator && 'SyncManager' in window) {
    var module = {
        id: 'sync module',
        name: 'module to be synced',
        meta: 'this is the module that we are gonna sync in bacground'
    }
    promise.then(function() {
        navigator.serviceWorker.ready.then(function(sw) {
            writeData('sync-modules', module).then(function() {
                return sw.sync.register('background-sync')
            }).then(function() {
                alert("your module will be synced in background");
            })
        }).catch(function(err) {
            console.log(err);
        })

    })

} else {
    // directly submit the post on user action.
    /**
     * This is progressive enchancement (if we write this code obviously ;)
     * so if feature is available use it else work like it never was there
     */
}