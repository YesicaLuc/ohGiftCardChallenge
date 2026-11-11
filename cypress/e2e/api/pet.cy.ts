import { faker } from '@faker-js/faker';
import { buildPet, generatePetId } from '../../support/factories/pet';

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
        expect(res.body.id).to.eq(pet.id);
        expect(res.body.name).to.eq(pet.name);
      });

      cy.request('GET', `${apiUrl}/pet/${pet.id}`).then((res) => {
        expect(res.status).to.eq(200);
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
        expect(res.body.id).to.eq(pet.id);
        expect(res.body.status).to.eq('sold');
      });

      cy.request('GET', `${apiUrl}/pet/${pet.id}`).then((res) => {
        expect(res.status).to.eq(200);
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
        expect(res.body.message).to.eq(String(pet.id));
        petId = undefined; //Como tengo un afterEach, aunq tenga el failOnStatusCode, dejo la variable como undefined
      });

      cy.request({ method: 'GET', url: `${apiUrl}/pet/${pet.id}`, failOnStatusCode: false }).then(
        (res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('Pet not found');
        },
      );
    });
  });

  describe('Casos negativos', () => {
    //candidato a it.skip
    it('API devuelve 400 al consultar un id con formato inválido', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/pet/${faker.string.alphanumeric(10)}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });

    it('API devuelve 404 al consultar de id inexistente', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/pet/${generatePetId()}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });

    it('API devuelve 404 al eliminar un id inexistente', () => {
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/pet/${generatePetId()}`,
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.eq(404));
    });

    //candidato a it.skip
    it('Crear pet con payload invalido', () => {
      const invalidPet = { ...buildPet(), id: 'no-soy-un-numero' };
      cy.request({
        method: 'POST',
        url: `${apiUrl}/pet`,
        body: invalidPet,
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.eq(405));
    });

    //candidato a it.skip
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
