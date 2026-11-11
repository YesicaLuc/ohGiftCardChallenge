import { defineConfig } from 'cypress';
import mochawesomePlugin from 'cypress-mochawesome-reporter/plugin';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    baseUrl: 'https://buggy.justtestit.org',
    expose: {
      apiUrl: 'https://petstore.swagger.io/v2',
      buggyApiUrl: 'https://k51qryqov3.execute-api.ap-southeast-2.amazonaws.com/prod',
    },
    setupNodeEvents(on) {
      mochawesomePlugin(on);
    },
  },
});
