import { faker } from '@faker-js/faker';
import { buildPet, generatePetId } from '../../support/factories/pet';
import { validateSchema } from '../../support/validateSchema';
import { petSchema, apiResponseSchema } from '../../schemas/pet-schema';

describe('Petstore API - /pet', () => {
  const apiUrl = Cypress.expose('apiUrl');
  let petId: number | undefined;

  afterEach(() => {
    if (petId) {
      cy.request({ method: 'DELETE', url: `${apiUrl}/pet/${petId}`, failOnStatusCode: false });
      petId = undefined;
    }
  });

  describe('Ciclo de vida', () => {
    it('Crear una mascota y consultar existencia por id', () => {
      const pet = buildPet();
      petId = pet.id;

      cy.request('POST', `${apiUrl}/pet`, pet).then((res) => {
        expect(res.status).to.eq(200);
        validateSchema(petSchema, res.body);
        expect(res.body.id).to.eq(pet.id);
        expect(res.body.name).to.eq(pet.name);
      });

      cy.request('GET', `${apiUrl}/pet/${pet.id}`).then((res) => {
        expect(res.status).to.eq(200);
        validateSchema(petSchema, res.body);
        expect(res.body.name).to.eq(pet.name);
        expect(res.body.status).to.eq('available');
      });
    });

    it('Actualizar el estado de una mascota a sold', () => {
      const pet = buildPet();
      petId = pet.id;

      cy.request('POST', `${apiUrl}/pet`, pet).its('status').should('eq', 200);

      cy.request('PUT', `${apiUrl}/pet`, { ...pet, status: 'sold' }).then((res) => {
        expect(res.status).to.eq(200);
        validateSchema(petSchema, res.body);
        expect(res.body.id).to.eq(pet.id);
        expect(res.body.status).to.eq('sold');
      });

      cy.request('GET', `${apiUrl}/pet/${pet.id}`).then((res) => {
        expect(res.status).to.eq(200);
        validateSchema(petSchema, res.body);
        expect(res.body.name).to.eq(pet.name);
        expect(res.body.status).to.eq('sold');
      });
    });

    it('Eliminar una mascota y comprobar que ya no existe', () => {
      const pet = buildPet();
      petId = pet.id;

      cy.request('POST', `${apiUrl}/pet`, pet).its('status').should('eq', 200);

      cy.request('DELETE', `${apiUrl}/pet/${pet.id}`).then((res) => {
        expect(res.status).to.eq(200);
        validateSchema(apiResponseSchema, res.body);
        expect(res.body.message).to.eq(String(pet.id));
        petId = undefined; // ya se borró: el afterEach no tiene que limpiar
      });

      cy.request({ method: 'GET', url: `${apiUrl}/pet/${pet.id}`, failOnStatusCode: false }).then(
        (res) => {
          expect(res.status).to.eq(404);
          validateSchema(apiResponseSchema, res.body);
          expect(res.body.message).to.eq('Pet not found');
        },
      );
    });
  });

  describe('Casos negativos', () => {
    // Hallazgo #2: la documentación indica 400, la API responde 404. Falla a propósito, ver README.
    it('API devuelve 400 al consultar un id con formato inválido', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/pet/${faker.string.alphanumeric(10)}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });

    it('API devuelve 404 al consultar un id inexistente', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/pet/${generatePetId()}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
        validateSchema(apiResponseSchema, res.body);
        expect(res.body.message).to.eq('Pet not found');
      });
    });

    it('API devuelve 404 al eliminar un id inexistente', () => {
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/pet/${generatePetId()}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });

    // Hallazgo #1: la documentación indica 405, la API responde 500. Falla a propósito, ver README.
    it('API rechaza crear una mascota con un id de tipo inválido', () => {
      const invalidPet = { ...buildPet(), id: 'no-soy-un-numero' };

      cy.request({
        method: 'POST',
        url: `${apiUrl}/pet`,
        body: invalidPet,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(405);
      });
    });

    // Hallazgo #3: la documentación solo admite available/pending/sold, la API acepta 'adopted'. Falla a propósito, ver README.
    it('API rechaza actualizar una mascota con un status fuera del enum', () => {
      const pet = buildPet();
      petId = pet.id;

      cy.request('POST', `${apiUrl}/pet`, pet).its('status').should('eq', 200);

      cy.request({
        method: 'PUT',
        url: `${apiUrl}/pet`,
        body: { ...pet, status: 'adopted' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(405);
      });
    });
  });
});
