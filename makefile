install:
	npm install

clean:
	rm -rf node_modules

build:
	node ./node_modules/gulp/bin/gulp

test:
	npm test

start:
	npm start
