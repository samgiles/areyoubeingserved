# Are you being served?

Is your service accepting requests yet?

```
bin/waitfortcp --host localhost --port 3000 --timeout 20
```

An extensible library for waiting on things, and managing runtime dependencies.
Useful when using something like `docker-compose` to create your environment,
you can order things based on the readiness of other services.

## Command line wait for a TCP connection

This can be applied to most things: an HTTP(S) server, a database server, etc.

This command will wait for localhost to listen on port 3000 for up to 20
seconds.

```
bin/waitfortcp --host localhost --port 3000 --timeout 20
```

### Example with `docker-compose`, a database, and a Node.JS app


#### ./Dockerfile

Simple Dockerfile for a Node app, notably the entry point is `npm start`.

```
FROM mhart/alpine-node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start"]
```

#### ./docker-compose.yml

Our app depends on a PostGIS database `db`.

```YAML
version: "2"
services:
  db:
    image: mdillon/postgis
    environment:
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
  myapp:
    build:
      context: ./
    depends_on:
      - db
    links:
      - db
    ports:
      - "3000:3000"
```

#### ./package.json

In `prestart` we wait for the database port to accept a connection before running our database migrations.

```JSON
{
  "name": "myapp",
  "main": "index.js",
  "scripts": {
    "prestart": "waitfortcp --host db --port 5432 && db-migrate up",
    "start": "bin/service",
  },
  "author": "Awesome Developer <you@domain.com>",
  "license": "MPL-2.0",
  "dependencies": {
    "areyoubeingserved": "^1.0.0",
	"db-migrate": "*"
  }
}
```


## Extending

You can resuse the retry logic, the library exports a function `createRetry`.

```
createRetry(timeoutInSeconds, function)
```

The function should return true, if the test succeeded, or false if not, and can
return `Promise` equivalents.

### Example

```
const { createRetry } = require('waitforit');

createRetry(10, function() {
  return new Promise((resolve, reject) => {
    doThing((err) => {
      if (err) {
        // Not ready :(
        resolve(false);
      } else {
        // Ready!
        resolve(true);
      }
    });
  });
});
```

# License

MPL-2.0
