# QA Automation Challenge (SDET)

Suite de pruebas automatizadas con Cypress y TypeScript, en tres partes:

1. **API:** ciclo de vida del recurso `/pet` de [Swagger Petstore](https://petstore.swagger.io/).
2. **UI:** registro, login, votación y logout en [Buggy Cars Rating](https://buggy.justtestit.org/).
3. **CI:** GitHub Actions corre las dos suites en cada push y publica el reporte como artifact.

## Requisitos

- Node.js 22, 24 o 26+. Cypress 16 no soporta Node 20 ni 25.
- npm

## Instalación y ejecución

```bash
git clone https://github.com/YesicaLuc/ohGiftCardChallenge.git
cd ohGiftCardChallenge
npm install
```

| Comando                                   | Qué hace                                                            |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `npm test`                                | Corre las dos suites (sin los known bugs)                           |
| `npm run test:api`                        | Corre solo la suite de API (sin los known bugs)                     |
| `npm run test:ui`                         | Corre solo la suite de UI                                           |
| `npm run test:known-bugs`                 | Corre solo los tests de [known bugs](#known-bugs-pendientes-de-fix) |
| `npx cypress open`                        | Abre Cypress en modo interactivo                                    |
| `npm run lint` / `npm run lint:fix`       | ESLint                                                              |
| `npm run format` / `npm run format:check` | Prettier                                                            |
| `npm run test:postman`                    | Corre la colección de Postman con Newman                            |

Después de cada corrida, el reporte queda en `cypress/reports/index.html`.

No hace falta configurar credenciales: los usuarios se generan en cada ejecución.

### Variables de entorno

Las URLs tienen como valor por defecto los ambientes públicos del challenge. Para apuntar a otro ambiente, se sobrescriben con variables de entorno, sin tocar código:

| Variable           | Default                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `BASE_URL`         | `https://buggy.justtestit.org`                                     |
| `BUGGY_API_URL`    | `https://k51qryqov3.execute-api.ap-southeast-2.amazonaws.com/prod` |
| `PETSTORE_API_URL` | `https://petstore.swagger.io/v2`                                   |

```bash
# macOS / Linux
PETSTORE_API_URL=https://petstore.staging.example/v2 npm run test:api
```

```powershell
# Windows (PowerShell)
$env:PETSTORE_API_URL="https://petstore.staging.example/v2"; npm run test:api
```

### Windows

El proyecto corre igual en Windows, macOS y Linux: los scripts de npm no usan sintaxis de una shell en particular, y `.gitattributes` fuerza los finales de línea LF para que `format:check` no falle después de un checkout en Windows.

> Si corrés Cypress desde la terminal integrada de VS Code y falla con `bad option: --no-sandbox`, es porque VS Code exporta `ELECTRON_RUN_AS_NODE=1`. Antes de correr los tests, ejecutá `unset ELECTRON_RUN_AS_NODE` (macOS / Linux) o `Remove-Item Env:ELECTRON_RUN_AS_NODE` (PowerShell).

## Estructura

```
cypress/
  e2e/
    api/pet.cy.ts          tests de Petstore
    ui/auth.cy.ts          registro, login y logout
    ui/vote.cy.ts          votación con comentario
  pages/                   Page Objects (HomePage, RegisterPage, LoginForm, ModelPage)
  schemas/pet-schema.ts    schemas de Zod para validar contratos
  support/
    factories/             datos de prueba (buildPet, buildUser)
    commands.ts            registerUserByApi, loginByApi
    validateSchema.ts      helper de validación de schema
  types/                   tipos de librerías que no los traen
postman/                   colección de Postman y entorno (baseUrl)
cypress.config.ts          URLs (sobrescribibles por variables de entorno), reporter y grep
.nvmrc                     versión de Node que usan el pipeline y nvm
.github/workflows/e2e.yml  pipeline
```

## Colección de Postman (opcional)

`postman/` tiene una colección equivalente a la suite de API, ejecutable con Newman: el mismo ciclo de vida, los mismos casos negativos y los tres hallazgos, que también esperan lo documentado y fallan a propósito. La URL está en el archivo de entorno, fuera de la colección.

Para mantener las mismas reglas que en Cypress:

- Los ids se generan en los pre-request scripts con `Date.now()` más un número aleatorio.
- Las respuestas se validan con JSON Schema (`pm.response.to.have.jsonSchema`), con los mismos dos modelos: `Pet` y `ApiResponse`.
- El caso del `status` fuera del enum crea su propia mascota en el pre-request y la borra en el test, aunque la assertion falle.

Una diferencia con Cypress: Newman corre los requests del ciclo de vida en secuencia y comparten la mascota, así que ahí los pasos dependen entre sí. Es la forma natural de una colección de Postman; la independencia entre tests la cubre la suite de Cypress.

## Casos automatizados

| ID     | Suite | Caso                                   | Qué valida                                                               |
| ------ | ----- | -------------------------------------- | ------------------------------------------------------------------------ |
| API-01 | API   | Crear una mascota y consultarla        | Status, schema y que los datos coincidan con los enviados                |
| API-02 | API   | Actualizar el estado a `sold`          | Status, schema y que el cambio persista en un `GET` posterior            |
| API-03 | API   | Eliminar una mascota                   | Status, schema, id eliminado y `404` en la consulta posterior            |
| API-04 | API   | Consultar un id inexistente            | `404` y mensaje `Pet not found`                                          |
| API-05 | API   | Eliminar un id inexistente             | `404`                                                                    |
| API-06 | API   | Consultar un id con formato inválido   | `400` según la documentación (hallazgo #2, `@known-bug`)                 |
| API-07 | API   | Crear con un id de tipo incorrecto     | `405` según la documentación (hallazgo #1, `@known-bug`)                 |
| API-08 | API   | Actualizar con `status` fuera del enum | `405` según la documentación (hallazgo #3, `@known-bug`)                 |
| UI-01  | UI    | Registro                               | Mensaje "Registration is successful"                                     |
| UI-02  | UI    | Login exitoso                          | Saludo con el nombre del usuario y link de Logout                        |
| UI-03  | UI    | Login con credenciales inválidas       | Mensaje "Invalid username/password"                                      |
| UI-04  | UI    | Login con campos vacíos                | Validación nativa del input y que no se envíe el request                 |
| UI-05  | UI    | Votar con comentario                   | Voto registrado, comentario guardado en el backend y visible en la tabla |
| UI-06  | UI    | Logout                                 | Desaparece el saludo y vuelve el formulario de login                     |

## Decisiones técnicas

### Cypress para API y UI

La API se podía automatizar con otra herramienta, pero usé `cy.request` en las dos partes: un solo runner, un solo reporte y un solo pipeline.

### Configuración

Las URLs (sitio, API de Buggy Cars y Petstore) se definen en `cypress.config.ts`, que las lee de variables de entorno con un valor por defecto (ver [Variables de entorno](#variables-de-entorno)). Así se cambia de ambiente sin tocar código, y quien clona el repo lo puede correr sin configurar nada. En Cypress 16 ya no existe `Cypress.env()`, así que los valores públicos van en `expose` y se leen con `Cypress.expose()`. Si en el futuro hiciera falta un secreto, iría por `cy.env()`, que lo mantiene en el proceso de Node y no lo expone en el navegador. Hoy no hay ninguno: cada test crea su propio usuario.

TypeScript está fijado en 6.0 porque `typescript-eslint` todavía no soporta la versión 7.

### Datos de prueba en entornos compartidos

Petstore y Buggy Cars son públicos, así que cualquiera puede crear datos con los mismos valores que mis tests. Por eso:

- Los ids de mascotas se generan con `Date.now()` más un número aleatorio. El contrato define el id como `int64`, así que es numérico.
- Los usuarios tienen un username con timestamp, y la contraseña siempre cumple la política del sitio.
- Ningún id está hardcodeado. Un test que usaba un id "inexistente" fijo falló porque otra persona había creado una mascota con ese id.
- En la API, cada test crea su propia mascota y la borra en un `afterEach`, así se limpia aunque el test falle.

### API: contrato y respuestas no documentadas

Valido el schema de cada respuesta con Zod. Hay dos schemas porque la API devuelve dos formas: el modelo `Pet` (`POST`, `PUT` y `GET` exitosos) y `ApiResponse` (`{ code, type, message }`, que devuelven el `DELETE` exitoso y los `404`).

`POST`, `PUT` y `DELETE` no documentan su respuesta exitosa. Para saber qué esperar, los ejecuté desde Swagger: `POST` y `PUT` devuelven el modelo `Pet`, y `DELETE` devuelve un `ApiResponse` con el id eliminado en `message`.

### Known bugs (pendientes de fix)

La consigna pide no forzar los tests cuando la API no cumple su documentación. Esos tres tests esperan lo documentado (no lo que la API responde hoy) y tienen el tag `@known-bug`, con un comentario que remite a los [hallazgos](#hallazgos-api-petstore).

Al principio los dejé fallando dentro de la suite de API, pero eso dejaba el job principal siempre en rojo, y un pipeline siempre en rojo no avisa nada: si mañana se rompe el ciclo de vida, nadie lo nota. Por eso los separé con [`@cypress/grep`](https://github.com/cypress-io/cypress/tree/develop/npm/grep):

- **Job principal** (`npm run test:api`, `npm test`): corre con `grepTags=-@known-bug`. Los known bugs aparecen en el reporte como **pending**, así quedan visibles como pendientes de fix sin tapar regresiones reales.
- **Job `known-bugs`** (`npm run test:known-bugs`): corre solo esos tests, con `continue-on-error` en CI. Hoy falla, y es lo esperado. Si la API se corrige, el job pasa a verde y es la señal para sacarles el tag y devolverlos a la suite principal.

Elegí esto en vez de `it.skip` porque un test skipeado no se ejecuta nunca: no avisaría cuando la API cambie. Tampoco los modifiqué para que esperen el comportamiento actual (500, 404 y 200), porque eso sería convertir un bug en el comportamiento esperado.

En un proyecto real, cada tag tendría además el id del ticket (por ejemplo `@known-bug` + `@PET-123`), para que el reporte enlace al bug y el test se reactive cuando se cierre el ticket.

### UI: Page Object Model

Elegí Page Objects porque las mismas pantallas se usan en varios tests, y si cambia un selector se corrige en un solo lugar. Para que eso se cumpla, cada page object define sus selectores en un objeto `selectors` y los tests nunca usan `cy.get` directo sobre elementos de la página. Los métodos solo hacen acciones o devuelven elementos; las assertions quedan en los tests, que es donde se ve qué se está probando.

`LoginForm` no es una página: es el formulario del header, presente en todo el sitio. Por eso está separado.

### UI: selectores

El sitio no tiene atributos `data-*` pensados para testing. Usé, en este orden:

1. **Ids** (`#username`, `#comment`, etc.).
2. **Atributo `name`**, acotado al componente de Angular (`my-login input[name="password"]`). Esto hace falta porque en la página de registro hay dos campos `name="password"`, el del header y el del formulario.
3. **Texto visible** para botones y mensajes (`cy.contains('button', 'Vote!')`).

Descarté los XPath absolutos (se rompen con cualquier cambio de estructura) y los atributos `_ngcontent-*`, que Angular regenera en cada build.

**Trade-off:** algunos elementos no tienen id, `name` ni un texto único, así que dependen de clases de Bootstrap o de la estructura: el contador de votos (`.card-block h4 strong`), el mensaje de error del login (`.label-warning`) y el de registro exitoso (`.result.alert-success`). Son los selectores más frágiles de la suite. Por eso están centralizados en los page objects y, cuando se puede, se combinan con el texto esperado. Con acceso al código de la app, lo correcto sería agregar atributos `data-testid`.

### UI: independencia y setup por API

Cada test prueba una sola cosa y no depende de los otros:

- Solo el test de registro usa la UI de registro. Los demás crean el usuario por API (`cy.registerUserByApi`).
- Solo los tests de login usan la UI de login. Votación y logout se loguean por API (`cy.loginByApi`): piden el token a `/oauth/token`, lo guardan en `localStorage` antes de que cargue la app, y `cy.session` cachea la sesión.

Así, si se rompe el login, falla el test de login y no también los de votación y logout.

La clave `token` de `localStorage` sale del código de la app (`AuthApiService` la lee al iniciar). Como cada test crea un usuario nuevo, `cy.session` no reutiliza sesiones entre tests. Lo uso porque aísla el estado (limpia cookies y storage al crear la sesión) y porque, si un día se comparte un usuario entre tests, el cacheo funciona sin cambiar nada.

### Sin esperas fijas

- Las assertions con `.should()` reintentan hasta que se cumplen.
- Donde la pantalla depende de una respuesta del servidor, espero ese request con `cy.intercept` y `cy.wait('@alias')`.

En la votación, el mensaje de confirmación y el contador se actualizan recién cuando la app vuelve a pedir el modelo después del voto, y ese request a veces tarda más de 4 segundos. En vez de subir timeouts, defino un alias nuevo (`getModelAfterVote`) justo antes de votar, para esperar ese request puntual y no los de la carga inicial.

### Votación: validación en tres capas

El test de votación verifica por separado:

1. Que el voto se registró (mensaje de confirmación y contador +1).
2. Que el backend guardó el comentario (consulta directa a la API del modelo).
3. Que la tabla muestra el comentario.

Si falla, el mensaje indica en qué capa. Eso permitió confirmar que una falla intermitente no era del test sino de la app (ver [hallazgos de UI](#hallazgos-buggy-cars)).

### Login con campos vacíos

La app no muestra un mensaje propio: usa la validación nativa de HTML5 (`required`). Ese globo lo dibuja el navegador y no existe en el DOM, así que valido el estado del input (`validity.valueMissing`) y que no se haya enviado el request de login. No comparo el texto del mensaje porque depende del idioma del navegador.

### `cy.visit('/')` antes del setup por API

Los tests de votación y logout arrancan con requests, sin página cargada. En modo interactivo, el runner fallaba al intentar mostrar el snapshot de esos comandos. Cargar el home primero lo evita y no cambia lo que prueba el test. En modo `run` no pasa.

## CI

El workflow (`.github/workflows/e2e.yml`) corre en cada push:

- Un job de `lint` (ESLint y `prettier --check`), separado para no repetirlo en cada suite. No descarga el binario de Cypress.
- Tres jobs de tests en paralelo con una matriz (`api`, `ui` y `known-bugs`), con `fail-fast: false` para que una suite no cancele la otra.
- `known-bugs` tiene `continue-on-error`: muestra los hallazgos sin poner el pipeline en rojo (ver [Known bugs](#known-bugs-pendientes-de-fix)).
- La versión de Node sale de `.nvmrc`. `npm ci` instala exactamente lo del lockfile, y el binario de Cypress se cachea por hash del lockfile.
- El reporte de Mochawesome, con capturas de los tests fallidos, se sube como artifact (`report-api`, `report-ui` y `report-known-bugs`) aunque los tests fallen.
- Ubuntu fijado en 24.04, para que el entorno no cambie cuando GitHub actualice `ubuntu-latest`.

## Hallazgos (API Petstore)

| #   | Caso                                                     | Documentación                                    | Comportamiento real                                                           | Test                      |
| --- | -------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------- |
| 1   | `POST /pet` con `id` de tipo inválido (string)           | `405 Invalid input`                              | `500`                                                                         | Falla (hallazgo conocido) |
| 2   | `GET /pet/{petId}` con id alfanumérico                   | `400 Invalid ID supplied`                        | `404`                                                                         | Falla (hallazgo conocido) |
| 3   | `PUT /pet` con `status` fuera del enum (`adopted`)       | Solo admite `available`, `pending` y `sold`      | Lo acepta y lo guarda                                                         | Falla (hallazgo conocido) |
| 4   | `POST /pet`, `PUT /pet` y `DELETE /pet/{petId}` exitosos | No documentan la respuesta exitosa, solo errores | Responden `200`                                                               | Observación               |
| 5   | `DELETE /pet/{petId}` con id inexistente                 | `404 Pet not found`                              | `404` sin body, mientras que el `404` de `GET` devuelve un JSON con `message` | Observación               |

## Hallazgos (Buggy Cars)

Los bugs encontrados en la exploración manual, con pasos para reproducir y severidad, están en [BUGS.md](BUGS.md). Estos dos se relacionan con la suite automatizada:

- **El comentario se pierde de forma intermitente.** A veces el voto se registra (el usuario ve "Thank you for your vote!" y el contador sube), pero el comentario nunca se guarda. Lo confirmé consultando la API del modelo minutos después: el comentario no estaba. El test de votación falla cuando pasa, con el mensaje "el backend guardó el comentario". No es inestabilidad del test, así que no le agregué reintentos.
- **El autor de los comentarios está vacío.** No es solo de la pantalla: la API devuelve `"user": ""` en todos los comentarios, así que el backend los guarda sin usuario.

## Estrategia de pruebas

Qué más probaría en Buggy Cars, en qué nivel, y qué dejaría fuera de la automatización: [ESTRATEGIA.md](ESTRATEGIA.md).

## Trade-offs

- Crear datos en cada test hace la suite más lenta, pero la vuelve independiente del orden y de lo que haga otra gente en los entornos compartidos.
- El test de votación compara el contador antes y después de votar. Si otra persona vota el mismo modelo en ese instante, el contador sube 2 y el test falla. Es poco probable, pero posible.
- Los usuarios que crean los tests de UI quedan en Buggy Cars, porque el sitio no expone una forma de borrarlos.

## Qué agregaría con más tiempo

- Correr la suite de UI en más de un navegador (Chrome y Firefox) dentro de la matriz.
- Generar los schemas de Zod a partir del OpenAPI de Petstore en vez de escribirlos a mano.
- Elegir el modelo a votar por API (por ejemplo, el primero del ranking) en lugar de usar el id fijo del Lamborghini Diablo, para que el test no dependa de que ese modelo exista.
- Casos negativos de registro (contraseñas que no coinciden, usuario existente, política de contraseña).
- Ejecución programada del pipeline (por ejemplo, diaria) para detectar cambios en las APIs sin depender de un push.

Evalué usar BDD (Cucumber) y no lo sumé: para una suite de este tamaño, mantenida por un equipo técnico, agrega una capa de indirección sin mucho beneficio.
