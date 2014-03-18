# Instalive

Displays a constant flow of instagram images from a given geographic location.
Images are pushed to connected browsers over websockets.

Uses browserify to utilize npm modules in the browser.

Se tout.


## Setup

These shell environment variables are mandatory:

    INSTALIVE_DOMAINNAME=<fqdn>
    INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>


## Deploy to heroku

    heroku config:set INSTALIVE_DOMAINNAME=<fqdn>
    heroku config:set INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    heroku config:set INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>

    gulp scripts


## Test

Tests are located under test(!). Run them using mocha.

    npm install -g mocha
    NODE_ENV=development mocha

