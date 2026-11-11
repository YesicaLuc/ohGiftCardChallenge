import { faker } from '@faker-js/faker';

export type User = ReturnType<typeof buildUser>;

export const buildUser = () => ({
  username: `qa_${Date.now()}_${faker.string.alphanumeric(4)}`,
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: `${faker.internet.password({ length: 8 })}Aa1!`,
});
