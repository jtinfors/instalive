# Instalive

## Setup

Set these shell environment variables:

    INSTALIVE_DOMAINNAME=<fqdn>
    INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>

For a heroku deployment that would be:

    heroku config:set INSTALIVE_DOMAINNAME=<fqdn>
    heroku config:set INSTAGRAM_CLIENT_ID=<INSTAGRAM_CLIENT_ID>
    heroku config:set INSTAGRAM_CLIENT_SECRET=<INSTAGRAM_CLIENT_SECRET>


## Test

Tests are located under test(!). Run them using mocha.

    npm install -g mocha
    NODE_ENV=development mocha [--no-colors]

