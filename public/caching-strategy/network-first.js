// Network First Approach
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request)
        .then(function(res) {
            return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                    cache.put(event.request.url, res.clone());
                    return res;
                })
        })
        .catch(function(err) {
            return caches.match(event.request);
        })
    );
});