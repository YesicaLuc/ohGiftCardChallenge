import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://buggy.justtestit.org',
    expose: {
      apiUrl: 'https://petstore.swagger.io/v2',
    },
  },
});
