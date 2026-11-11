import { faker } from '@faker-js/faker';
import type { Pet } from '../../schemas/pet-schema';

export const generatePetId = () => Date.now() + faker.number.int({ min: 0, max: 9999 });

export const buildPet = (overrides: Partial<Pet> = {}): Pet => ({
  id: generatePetId(),
  name: faker.animal.dog(),
  status: 'available',
  photoUrls: [faker.image.url()],
  ...overrides,
});
