import { register as registerCypressGrep } from '@cypress/grep';
import 'cypress-mochawesome-reporter/register';
import './commands';

registerCypressGrep();
