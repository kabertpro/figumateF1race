# FIGUMATE GAME — Kabert Studio Pro · LMKE
Juego 3D de carreras estilo bloques para aprender a sumar figuras musicales. Niveles 1-20 (ver `LV_POOLS` en `figures.js`). Sitio estático (Three.js r128 por CDN).
Web: https://kabert-edulab.vercel.app/ · WhatsApp 65596602

## Publicar
1. Sube esta carpeta al repo `kabertpro/figumategame`.
2. Copia tus PNG a `figuras/` con los nombres de las claves: negra, negra-sil, blanca, blanca-sil, redonda, redonda-sil, corchea, corchea-sil, semicorchea, semicorchea-sil, corro, pescame, sabado, detengo, ligerito, tresillo, salto, vamos (todas `.png`). Si falta alguno, el juego lo busca en GitHub y, si tampoco está, avisa su nombre.
3. Copia tus mp3 a `audio/` (nombres en `audio/LEEME.txt`).
4. Settings → Pages → rama `main` / raíz.
Local: `python3 -m http.server` y abre http://localhost:8000.

## Audio (7 archivos .mp3 en `audio/`)
`menu.mp3` · `carrera1.mp3` … `carrera5.mp3` · `final.mp3`
- Menú y garaje: `menu.mp3` en bucle. Carrera: las 5 canciones en cadena y en bucle. Tarjeta final: `final.mp3` en bucle.
- Al aparecer una pregunta la música baja de volumen; en pausa se detiene.
- Sin archivos, suena un chiptune de respaldo. Los efectos de sonido son sintetizados (no necesitan archivos).
- El navegador solo permite sonido tras un toque: por eso el splash pide "TOCAR PARA EMPEZAR".

## Novedades
Aspecto de bloques, splash, garaje (modelo, colores, franjas, alerón, neón), usuario con récord por nivel (al cambiar el nombre vuelve a cero) y tarjeta final para guardar como PNG o compartir.
Configuración (tiempo, energía, velocidad, disparos por enemigo): constante `CFG` al inicio de `game.js`.
