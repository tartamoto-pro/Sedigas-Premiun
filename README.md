# Destreza visual · Recertificación Sedigas Premium

Web de práctica para el examen teórico-práctico (destreza visual) de la recertificación Sedigas Premium: PAD-1, PAD-2, OD y AU.

- **99 casos** con dibujo o foto, 35 de ellos nuevos.
- **Simulacro Premium**: 20 casos al azar (6 PAD-1, 6 PAD-2, 3 OD y 5 AU), con nota al final. Se aprueba con 16.
- **Práctica por bloques** con corrección inmediata, y repaso solo de los fallos.
- Las respuestas siguen las especificaciones Sedigas Rev. 02 (octubre de 2025) y los cambios de la UNE 60670:2023.
- **Guía de estudio** en la carpeta `guia/`: chuleta de cotas con dibujos, novedades de 2025 y casos tipo resueltos, con modo repaso para ocultar las respuestas. Se abre desde el botón «Guía de estudio» de la portada.
- No necesita servidor ni instalar nada. El progreso se guarda en el navegador de cada dispositivo.

## Probarla en tu ordenador

Descomprime la carpeta y abre `index.html` con el navegador.

## Publicarla en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `destreza-visual`).
2. Sube **todo el contenido** de esta carpeta a la raíz del repositorio: `index.html`, `app.js`, `styles.css`, `preguntas.js` y las carpetas `img/` y `guia/`.
   Desde la web: *Add file → Upload files*, arrastra los archivos y la carpeta, y pulsa *Commit changes*.
3. Ve a *Settings → Pages*. En *Build and deployment*, elige *Deploy from a branch*, la rama `main` y la carpeta `/ (root)`, y pulsa *Save*.
4. En uno o dos minutos la web estará en `https://TU-USUARIO.github.io/destreza-visual/`.

> **Ojo con la privacidad.** Los dibujos proceden de material de Sedigas, que no permite su reproducción. En un repositorio público cualquiera podría verlos. Lo más prudente es un repositorio **privado**. GitHub Pages con repositorio privado necesita una cuenta de pago; si no la tienes, puedes usar la web en local o compartirla solo con tus compañeros.

## Añadir preguntas

Edita `preguntas.js`. Cada pregunta es un bloque como este:

```js
{
 "id": "N36",
 "bloque": "PAD-2",            // PAD-1, PAD-2, OD o AU
 "etiqueta": "PAD-2",
 "img": "img/nueva.jpg",       // o null si no lleva dibujo
 "tipo": "AN",
 "pregunta": "Texto de la pregunta…",
 "opciones": ["Sin defecto", "Anomalía secundaria", "Anomalía principal"],
 "correcta": "Anomalía secundaria",
 "solucion": "Explicación que se muestra al corregir.",
 "nueva": true
}
```

- Tipos con opciones: `CI` (Correcto / Incorrecto), `AN` (Sin defecto / Anomalía secundaria / Anomalía principal), `AC` (Correcta / Incorrecta) y `MC` (las opciones que quieras).
- Tipos de respuesta abierta: `OP` y `RS`. No llevan `opciones` ni `correcta`: se ve la solución y te autoevalúas.
- El texto de `correcta` tiene que ser exactamente igual que una de las `opciones`.
- Pon la imagen nueva en la carpeta `img/`.
- Cada `id` tiene que ser distinto de los demás.

## Atajos de teclado

- Teclas `1`, `2` y `3`: elegir respuesta.
- `Enter`: pasar a la siguiente pregunta en el modo práctica.
