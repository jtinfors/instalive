# Instalive

Displays a constant flow of instagram images from a given geographic location.
Images are pushed to connected browsers over websockets.

Se tout.


## Setup

These shell environment variables are mandatory:

    INSTALIVE_DOMAINNAME=<fqdn>
    INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>


## Compile

Client side javascript are located under `./client`.
Browserify is used to utilize npm modules in the browser.

`gulp [default]` is used to compile our js with dependend modules, run it before deployment..

    gulp


## Deploy to heroku

Add heroku as a git remote, see [Deploying with Git](https://devcenter.heroku.com/articles/git) for more info:

    heroku git:remote -a instalive

Before deploy, set these envs:

    heroku config:set INSTALIVE_DOMAINNAME=<fqdn>
    heroku config:set INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    heroku config:set INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>

Now, deploy:

    git push heroku master


## Test

Tests are located under test(!). Run them using mocha.

    npm install -g mocha
    NODE_ENV=development mocha

