# Instalive

Displays a constant flow of instagram images from a given geographic location.
Images are pushed to connected browsers over websockets.

Se tout.


## Setup

Download and Install [Heroku toolbelt](https://toolbelt.heroku.com/)

Install basic dependecies:
Use [homebrew](http://brew.sh/) for Mac OS X: `brew install node git`
For archlinux do: `pacman -S nodejs git`

Install project dependecies:

    npm install -g gulp mocha
    npm install

A couple of shell vars are used for the app runtime to talk to the instagram API, set them:

    INSTALIVE_DOMAINNAME=<fqdn>
    INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>


## Compile

Client side javascript are located under `./client`.  Browserify is used to utilize npm modules in the browser.
`gulp [default]` is used to compile our js with dependend npm modules, **it is important to run it before deploying**

    gulp


## Deploy to heroku

Add heroku as a git remote, see [deploying with Git](https://devcenter.heroku.com/articles/git) for more info.
If you are a collaborator of the project it should be enough to run:

    heroku git:remote -a instalive

Before deploy, set these heroku config vars:

    heroku config:set INSTALIVE_DOMAINNAME=<fqdn>
    heroku config:set INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    heroku config:set INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>

Now, deploy:

    git push heroku master


## Test

Tests are built using [mocha](http://visionmedia.github.io/mocha/), they are located under `./test`. Run them like so:

    NODE_ENV=development mocha

