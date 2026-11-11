# Estrategia de pruebas: Buggy Cars Rating

La idea general es probar cada regla en el nivel más bajo donde se pueda detectar. La mayoría de la lógica de Buggy Cars vive en su API, así que ahí pondría el grueso de los tests, y dejaría la UI para los flujos críticos de punta a punta, que son los que ya cubre la suite.

## API

- **Registro:** cada regla de la política de contraseña por separado (largo, mayúscula, número, símbolo), usernames inválidos (con espacios, vacíos, muy largos) y usuario duplicado. Son muchas combinaciones, y por UI serían lentas y repetitivas.
- **Votación:** que un usuario no pueda votar dos veces el mismo modelo, que votar sin token devuelva `401`, y el límite de largo del comentario con un código de error consistente (hoy a veces es `400` y a veces `403`).
- **Persistencia del comentario:** votar y verificar en la API que el comentario se guardó. Es el bug más grave que encontré (BUG-01), y a nivel API se puede reproducir rápido y muchas veces.
- **Seguridad básica:** en los comentarios ya hay textos con HTML y SQL guardados por otros usuarios. Verificaría que se muestren escapados y que no se ejecuten.

## Contrato

El frontend de Angular depende de la forma exacta de las respuestas (`/models/{id}`, `/users/current`, `/dashboard`). Agregaría validación de schema sobre esas respuestas, como hice con Petstore, para detectar cambios del backend antes de que rompan la pantalla. A largo plazo, contract testing entre front y back (por ejemplo, con Pact).

## UI

Pocos tests, solo de flujos completos: los que ya están (registro, login, votación, logout), más editar el perfil y navegar el ranking general. Sumaría un chequeo de accesibilidad automatizado (axe) en las páginas principales y un par de viewports móviles en la página del modelo, que hoy no es responsive.

## Performance

Durante la automatización, la recarga del modelo después de votar tardó más de 4 segundos en algunas corridas. Mediría con k6 los tiempos de `GET /models`, `GET /dashboard` y del voto, con una línea base de p95. Como el sitio es público y compartido, con carga baja y coordinada, no una prueba de estrés.

## Qué dejaría fuera de la automatización

- **Exploración y UX:** si los mensajes de error se entienden, si el flujo de registro es claro. Necesita criterio humano, y fue justamente así como aparecieron la mayoría de los bugs.
- **Aspecto visual y diseño responsive en detalle:** automatizaría solo que el contenido sea usable en móvil; el juicio estético, no.
- **Pruebas de seguridad profundas:** un pentest puntual aporta más que tests automatizados para esto.
- **Los internals de la autenticación:** el login usa un proveedor externo (AWS Cognito). Probaría el contrato con nuestra app, no el proveedor en sí.
