# Bugs encontrados en Buggy Cars Rating

Entorno: https://buggy.justtestit.org, Chrome, noviembre de 2026.

---

## BUG-01: El voto se registra pero el comentario se pierde sin aviso

**Severidad:** Alta (pérdida de datos del usuario sin ningún aviso)

**Pasos para reproducir:**

1. Iniciar sesión con un usuario que todavía no haya votado el modelo.
2. Ir a un modelo, por ejemplo Lamborghini Diablo.
3. En "Your comment", pegar un texto largo pero por debajo del límite que da error. Por ejemplo, los dos primeros párrafos de la descripción del Diablo, cortando en "has lengthened the stroke by 0.16 inch".
4. Hacer clic en "Vote!".
5. Revisar la tabla de comentarios.

**Resultado esperado:** el comentario aparece en la tabla. Si por algún motivo no se puede guardar, la app lo informa y el usuario puede corregirlo.

**Resultado obtenido:** aparece "Thank you for your vote!" y el contador de votos sube, pero el comentario no aparece en la tabla ni en la respuesta de la API (`GET /prod/models/{id}`).

**Notas:** también pasa de forma intermitente con comentarios cortos. En la suite automatizada, el test de votación falla algunas veces porque el voto se registra y el comentario no llega al backend. Un comentario perdido en una corrida a las 10:42 seguía sin aparecer en la API 12 minutos después, así que no es una demora: el comentario no se guarda.

---

## BUG-02: Después del logout, Profile sigue mostrando los datos del usuario y permite editarlos

**Severidad:** Media (el backend rechaza los cambios, pero los datos personales quedan expuestos en dispositivos compartidos)

**Pasos para reproducir:**

1. Iniciar sesión.
2. Ir a Profile.
3. Hacer clic en Logout.
4. Modificar un campo del perfil y guardar.

**Resultado esperado:** al hacer logout, la página de Profile se limpia o redirige al home. Si se intenta guardar sin sesión, la app informa que hay que iniciar sesión.

**Resultado obtenido:** el navbar cambia, pero los datos del usuario siguen visibles y los campos siguen editables. Al guardar, la API responde `401 {"message":"Not authorized."}` y la pantalla muestra "Unknown error", sin explicar que la sesión terminó.

---

## BUG-03: El registro muestra al usuario los mensajes técnicos del backend

**Severidad:** Media (expone detalles internos y el usuario no sabe cómo corregir el error)

**Pasos para reproducir:**

1. Ir a Register.
2. En Login, escribir un nombre con un espacio, por ejemplo `juan perez`.
3. Completar el resto de los campos con datos válidos.
4. Hacer clic en Register.

**Resultado esperado:** un mensaje claro, por ejemplo "El usuario no puede contener espacios". Idealmente, validado antes de enviar el formulario.

**Resultado obtenido:** se muestra el error crudo del backend:

```
InvalidParameterException: 1 validation error detected: Value at 'username' failed to satisfy constraint: Member must satisfy regular expression pattern: [\p{L}\p{M}\p{S}\p{N}\p{P}]+
```

**Notas:** el resto de los errores del registro siguen el mismo patrón (`InvalidPasswordException: Password did not conform with policy...`, `UsernameExistsException: User already exists`). Además, la política de contraseña no se informa antes de enviar: el usuario la descubre de a un error por vez.

---

## Otros hallazgos (sin detallar)

- **El autor de los comentarios está vacío.** La columna Author de la tabla aparece vacía, y la API devuelve `"user": ""` en todos los comentarios: el problema está en el backend, no solo en la pantalla.
- **Errores inconsistentes según el largo del comentario.** Con un texto muy largo, a veces responde `403` y muestra "Unknown error", y otras `400` con "comment is too long". El campo no tiene límite de caracteres.
- **La imagen del auto en la página del modelo lleva al home** en vez de ampliar la imagen o quedarse en el modelo.
- **La página del modelo no es responsive:** en pantallas chicas el contenido se ve diminuto e ilegible.
