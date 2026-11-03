# FIGUMATE GAME — Kabert Studio Pro · LMKE

Niveles 1-20 seleccionables en el menú (figuras y dificultad de obstáculos escalan con el nivel; ver `LV_POOLS` en figures.js).
Juego 3D de carreras para aprender a sumar figuras musicales. Sitio estático (Three.js r128 por CDN).
## Publicar
1. Sube esta carpeta al repo `kabertpro/figumategame`.
2. Copia tus PNG a `figuras/` con los nombres de las claves: negra.png, negra-sil.png, blanca.png, redonda.png, corchea.png, semicorchea.png (+ sus `-sil`), corro, pescame, sabado, detengo, ligerito, tresillo, salto, vamos.
3. Settings → Pages → rama `main` / raíz.
Local: `python3 -m http.server` y abre http://localhost:8000. Si falta un PNG, el juego lo carga desde GitHub y, si tampoco está, avisa su nombre.
Configuración (tiempo, energía, velocidad, disparos por enemigo): constante `CFG` al inicio de `game.js`.
Web: https://kabert-edulab.vercel.app/ · WhatsApp 65596602
