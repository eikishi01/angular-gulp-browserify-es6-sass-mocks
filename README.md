# Angular APP seed

Feature list:

 * Gulp Task Manager
 * Angular 1.5 ready
 * Browserify
 * ES6 Ready with Babel
 * JS Linting with ES Lint
 * CSS Preprocessors (SASS)
 * Local Server for testing with Mock services support on Express.
 * Unit Test support with Karma, Jasmine, Chai

## How to use:

Start Local Server:

```javascript
npm start
```

This will automatically execute the npm install command to avoid adding dependencies during development and others get errors because they forgotten to run it previously.

On succesfull init it will keep watching for changes and compiling the code with the new changes

Unit tests:

```javascript
npm run test
```

This will start the Karma server with the PhantonJS browser and it will generate the coverage report in the project directory.
