const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000/api',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
