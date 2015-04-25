This is a simple demo web application.

Only purpose: Display temperature data recorded with a Raspberry Pi (RPi).

This code is intended to run on the same RPi as the data is recorded on.

If running the command `npm start` and visiting [http://localhost:3000/](http://localhost:3000/) does not work, please see below.

Otherwise visit [http://localhost:3000/temperatures](http://localhost:3000//temperatures).

# TL;DR Build instructions

Prerequisites: [node.js](https://nodejs.org/).

[Bower.js](http://bower.io/) is optional: All frontend stuff from bower is included in `/vendor/bower` (ie jquery, bootstrap, etc).

```
npm install
```

`npm install`: gets the backend dependencies (ie express.js, sqlite3-api for express).

# Quick test

```
npm start
```

Then open your browser at [http://localhost:3000/](http://localhost:3000/). Test for express.js

Then open your browser at [http://localhost:3000/temperatures](http://localhost:3000//temperatures). Tests the rest
