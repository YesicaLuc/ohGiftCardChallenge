import { defineConfig } from 'cypress';
import mochawesomePlugin from 'cypress-mochawesome-reporter/plugin';
import { plugin as cypressGrepPlugin } from '@cypress/grep/plugin';

// Cada URL se puede sobrescribir por variable de entorno para apuntar a otro ambiente.
// Los valores por defecto son los ambientes públicos del challenge.
const BASE_URL = process.env.BASE_URL ?? 'https://buggy.justtestit.org';
const BUGGY_API_URL =
  process.env.BUGGY_API_URL ?? 'https://k51qryqov3.execute-api.ap-southeast-2.amazonaws.com/prod';
const PETSTORE_API_URL = process.env.PETSTORE_API_URL ?? 'https://petstore.swagger.io/v2';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    baseUrl: BASE_URL,
    fixturesFolder: false,
    expose: {
      apiUrl: PETSTORE_API_URL,
      buggyApiUrl: BUGGY_API_URL,
    },
    setupNodeEvents(on, config) {
      mochawesomePlugin(on);
      cypressGrepPlugin(config);
      return config;
    },
  },
});
