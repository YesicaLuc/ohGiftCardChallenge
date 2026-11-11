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
        const body = validateSchema(petSchema, res.body);
        expect(body).to.deep.include(pet);
      });

      cy.request('GET', `${apiUrl}/pet/${pet.id}`).then((res) => {
        expect(res.status).to.eq(200);
        const body = validateSchema(petSchema, res.body);
        expect(body).to.deep.include(pet);
      });
    });

    it('Actualizar el estado de una mascota a sold', () => {
      const pet = buildPet();
      const updatedPet = { ...pet, status: 'sold' as const };
      petId = pet.id;

      cy.request('POST', `${apiUrl}/pet`, pet).its('status').should('eq', 200);

      cy.request('PUT', `${apiUrl}/pet`, updatedPet).then((res) => {
        expect(res.status).to.eq(200);
        const body = validateSchema(petSchema, res.body);
        expect(body).to.deep.include(updatedPet);
      });

      cy.request('GET', `${apiUrl}/pet/${pet.id}`).then((res) => {
        expect(res.status).to.eq(200);
        const body = validateSchema(petSchema, res.body);
        expect(body).to.deep.include(updatedPet);
      });
    });

    it('Eliminar una mascota y comprobar que ya no existe', () => {
      const pet = buildPet();
      petId = pet.id;

      cy.request('POST', `${apiUrl}/pet`, pet).its('status').should('eq', 200);

      cy.request('DELETE', `${apiUrl}/pet/${pet.id}`).then((res) => {
        expect(res.status).to.eq(200);
        const body = validateSchema(apiResponseSchema, res.body);
        expect(body.message).to.eq(String(pet.id));
        petId = undefined; // ya se borró: el afterEach no tiene que limpiar
      });

      cy.request({ method: 'GET', url: `${apiUrl}/pet/${pet.id}`, failOnStatusCode: false }).then(
        (res) => {
          expect(res.status).to.eq(404);
          const body = validateSchema(apiResponseSchema, res.body);
          expect(body.message).to.eq('Pet not found');
        },
      );
    });
  });

  // Los tests con tag @known-bug esperan lo que dice la documentación y fallan porque la API
  // no la cumple. Quedan pending en el job principal y corren aparte (ver "Known bugs" en el README).
  describe('Casos negativos', () => {
    it('API devuelve 404 al consultar un id inexistente', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/pet/${generatePetId()}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
        const body = validateSchema(apiResponseSchema, res.body);
        expect(body.message).to.eq('Pet not found');
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

    // Hallazgo #1: la documentación indica 405, la API responde 500.
    it('API rechaza crear una mascota con un id de tipo inválido', { tags: '@known-bug' }, () => {
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

    // Hallazgo #2: la documentación indica 400, la API responde 404.
    it('API devuelve 400 al consultar un id con formato inválido', { tags: '@known-bug' }, () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/pet/${faker.string.alphanumeric(10)}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });

    // Hallazgo #3: la documentación solo admite available/pending/sold, la API acepta 'adopted'.
    it(
      'API rechaza actualizar una mascota con un status fuera del enum',
      { tags: '@known-bug' },
      () => {
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
      },
    );
  });
});
