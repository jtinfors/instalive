# ![](public/img/twittercard.png?raw=true) Instalive

Displays a constant flow of instagram images from a given geographic location.
Images are pushed to connected browsers over websockets.

Se tout.


## Setup

Install basic dependecies:

For Mac OS X with [homebrew](http://brew.sh/) do: `brew install node git`

For archlinux do: `pacman -S nodejs git`

Install project dependecies:

    [sudo] npm install -g gulp mocha
    npm install

A couple of shell vars are used for the app runtime to talk to the instagram API, set them:

    INSTALIVE_DOMAINNAME=<fqdn>
    INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>


## Compile

Client side javascript are located under `./client`. [Browserify](http://browserify.org/) is used to utilize npm modules in the browser.
`gulp [default]` is used to compile our js with dependend npm modules.

**It is important to run gulp before deploying**

    gulp


## Deploy to heroku

Download and Install [Heroku toolbelt](https://toolbelt.heroku.com/)

Add heroku as a git remote, see [deploying with Git](https://devcenter.heroku.com/articles/git) for more info.
If you are a collaborator of the project it should be enough to run:

    heroku git:remote -a instalive

Add WebSocket support to your app:

    heroku labs:enable websockets --app <app_name>

Before deploy, set these heroku config vars:

    heroku config:set INSTALIVE_DOMAINNAME=<fqdn>
    heroku config:set INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    heroku config:set INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>

Now, deploy:

    git push heroku master

or, compile, commit and push in one push (pun intended):

    gulp && git commit -a -m '<message>' && git push heroku master


## Test

Tests are built using [mocha](http://visionmedia.github.io/mocha/), they are located under `./test`. Run them like so:

    NODE_ENV=development mocha

