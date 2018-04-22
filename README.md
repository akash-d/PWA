# PWA
PWA playground

This project is my test hands-on for PWA features.
Working offline, and notification and background sync are working in the project.

To add --> native device support

To run project checkout
run:
  npm install in the directory
  probably you should generate your own vapid keys.
  for that install web-push globally:
    npm install -g web-push
    then run
      web-push generate-vapid-keys
      
  Take a note of keys:
  replace public key in files : router/apis.js and public/javascripts/service-worker-registeration.js
  replace private key in router/apis.js
  
  
