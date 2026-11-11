# QA Automation Challenge - SDET

## Hallazgos (API Petstore)

Diferencias encontradas entre la [documentación de Swagger Petstore](https://petstore.swagger.io/) y el comportamiento real de la API en el recurso `/pet`.

Siguiendo la consigna, cuando la API responde distinto a lo documentado **no ajusté el test para que pase**: el test espera lo que dice la documentación y **falla a propósito**, con un comentario que remite a esta tabla. Preferí dejarlos fallar en vez de marcarlos con `it.skip` porque un test skipeado no se ejecuta: si la API se corrige, estos tests pasan a verde solos. Las observaciones no tienen un test asociado que falle.

| #   | Caso                                                     | Documentación                                                    | Comportamiento real                                                                 | Test                      |
| --- | -------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| 1   | `POST /pet` con `id` de tipo inválido (string)           | `405 Invalid input`                                              | `500`                                                                               | Falla (hallazgo conocido) |
| 2   | `GET /pet/{petId}` con id alfanumérico                   | `400 Invalid ID supplied`                                        | `404`                                                                               | Falla (hallazgo conocido) |
| 3   | `PUT /pet` con `status` fuera del enum (`adopted`)       | Solo admite `available`, `pending` y `sold`                      | Lo acepta y lo guarda                                                               | Falla (hallazgo conocido) |
| 4   | `POST /pet`, `PUT /pet` y `DELETE /pet/{petId}` exitosos | No documentan la respuesta exitosa: solo listan códigos de error | Responden `200`                                                                     | Observación               |
| 5   | `DELETE /pet/{petId}` con id inexistente                 | `404 Pet not found`                                              | `404` con body vacío, mientras que el `404` de `GET` devuelve un JSON con `message` | Observación               |

### Cómo validé las respuestas no documentadas

Como `POST /pet`, `PUT /pet` y `DELETE /pet/{petId}` no documentan su respuesta exitosa, ejecuté los requests desde Swagger ("Try it out") para ver el body real:

- **`POST` y `PUT`** devuelven el mismo modelo `Pet` que sí está documentado en `GET /pet/{petId}`, por eso las assertions de esas respuestas se basan en ese modelo.
- **`DELETE`** devuelve un objeto distinto: `{ "code": 200, "type": "unknown", "message": "<id eliminado>" }`. En cambio, su `404` no trae body (ver hallazgo #5).
