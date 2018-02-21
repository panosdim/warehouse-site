// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//TODO: change app.js and app.css to minified versions and /warehouse to /
var dataCacheName = 'warehousedata-v1';
var cacheName = 'warehouse-1';
var filesToCache = [
    '/',
    '/index.html',
    '/js/app.min.js',
    '/css/app.min.css',
    '/images/stock.svg',
    '/images/favicon-32x32.png',
    '/images/favicon-16x16.png'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function(e) {
	console.log('[Service Worker] Fetch', e.request.url);
	/*
	 * The app is asking for app shell files. In this scenario the app uses the
	 * "Cache, falling back to the network" offline strategy:
	 * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
	 */
	e.respondWith(
	  caches.match(e.request).then(function(response) {
	    return response || fetch(e.request);
	  })
	);
});