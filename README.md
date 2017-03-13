# ![](public/img/twittercard.png?raw=true) Instalive

Displays a constant flow of instagram images from a given geographic location.
Images are pushed to connected browsers over websockets.

Se tout.


## Setup

Install basic dependecies:

For Mac OS X with [homebrew](http://brew.sh/) do: `brew install node git`

For archlinux do: `pacman -S nodejs git`

For Ubuntu follow [these instructions](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

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

If you've forked this or is not a collaborator and wants to deploy on heroku; Make sure you run on their 'Cedar' stack and to add WebSocket support to your app:

    heroku labs:enable websockets --app <app_name>

Before deploy, a couple of  heroku config vars must be set. If the deployment target is already up and running they most likely are already set, check with `heroku config:get INSTALIVE_DOMAINNAME`. If that command returns empty you must set them, like so:

    heroku config:set INSTALIVE_DOMAINNAME=<fqdn>
    heroku config:set INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    heroku config:set INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>

Now, deploy:

    git push instalive master

or, compile, commit and push in one push (pun intended):

    gulp && git commit -a -m '<message>' && git push instalive master


## Test

Tests are built using [mocha](http://mochajs.org/), they are located under `./test`. Run them like so:

    NODE_ENV=development mocha

