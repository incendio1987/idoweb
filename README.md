# Idoia Esteban — Diseño de Producción

Portfolio web para diseño de producción cinematográfico.

## Estructura

```
idoia-web/
├── index.html          ← Página principal
├── data.json           ← Datos del sitio (tema, menú, películas)
├── css/
│   └── style.css       ← Estilos compartidos (variables CSS)
├── js/
│   └── main.js         ← JavaScript compartido (animaciones)
├── pages/
│   └── pelicula.html   ← Plantilla de página de película
├── img/
│   ├── posters/        ← Carteles (para las ventanitas laterales)
│   ├── ba/             ← Imágenes antes/después
│   └── gallery/        ← Galería de fotos
└── README.md
```

## Personalización rápida

Edita las variables en `:root` de `css/style.css`:
- Colores: `--color-primary`, `--color-bg`, etc.
- Tipografías: `--font-display`, `--font-body`, `--font-display-weight`, `--font-display-spacing`
- Tamaño menú: `--font-menu-size`, `--font-menu-spacing`
- Tamaños layout: `--circle-size`, `--poster-w`, `--poster-h`, `--menu-gap`

## Elementos interactivos

- **Nombre**: hover → flip animación tipo aeropuerto → "diseño de producción" → mouseout → vuelve
- **Ventanitas**: 4 marcos fijos en esquinas, carteles pasan horizontalmente (izq→der), cada uno diferente ritmo
- **Menú circular**: texto en MAYÚSCULAS curvado fuera del círculo, gira lento, hover = rectángulo invertido (fondo verde, letra blanca), click = rota smooth a las 12 y abre submenú
- **Antes/después**: transición sfumato cada 3s dentro del círculo
- **Flechas**: navegar entre trabajos

## Próximos pasos

1. Script Python `admin.py` para gestionar datos, subir imágenes, editar tema/fuentes/menú
2. Plantillas de páginas interiores
3. Deploy a GitHub Pages
