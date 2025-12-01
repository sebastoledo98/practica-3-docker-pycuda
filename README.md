# FastAPI + PyCUDA Image Processing (Backend) + React (Frontend)

Proyecto de ejemplo para procesar imágenes en GPU (PyCUDA / CuPy) con backend en FastAPI y frontend en React + TypeScript (Vite).
Recibe una imagen desde el frontend, ejecuta filtros en GPU (gaussiano, sobel, laplace, sharpen), y devuelve la imagen original en escala de grises y la imagen procesada junto con metadatos.

---

## Estructura sugerida

```
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── routes_images.py  # o filtros/procesar_imagen
│   └── core/
│       └── filters_gpu.py
frontend/
├── src/
│   └── App.tsx
...
```

---

## Requisitos

### Backend
- Python 3.9+
- libvips (sistema)
- Dependencias Python:
  - fastapi
  - uvicorn
  - pyvips
  - python-multipart
  - numpy
  - pycuda

Notas:
- libvips:
  - Ubuntu/Debian: `sudo apt install libvips`
  - macOS (Homebrew): `brew install vips`
  - Windows: usar conda o instalar binarios

### Frontend
- Node >= 18
- npm
- Vite + React + TypeScript

---

## Instalación y ejecución

### Backend

1. Crear y activar entorno virtual
```bash
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
```

2. Instalar dependencias
```bash
pip install fastapi uvicorn pyvips python-multipart numpy
# Instalar CuPy según tu CUDA, por ejemplo:
# pip install cupy-cuda12x
# o conda: conda install -c conda-forge cupy
```

3. Ejecutar servidor
```bash
uvicorn app.main:app --reload
```

La API correrá por defecto en `http://localhost:8000`. La documentación interactiva: `http://localhost:8000/docs`.

Asegúrate de habilitar CORS si el frontend corre en otro puerto (ej. Vite en 5173):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"], #colocar solo las IPs permitidas
  allow_methods=["*"],
  allow_headers=["*"],
)
```

### Frontend

1. Instalar dependencias
```bash
npm install
```

2. Ejecutar en modo desarrollo
```bash
npm run dev
```

Abrir `http://localhost:5173`.

---

## Endpoint principal (backend)

POST `/filtros/procesar_imagen`

- Content-Type: `multipart/form-data`
- Campos esperados:
  - `file` — archivo de imagen (UploadFile)
  - `filtro` — string (`"gaussiano"`, `"sobel"`, `"laplace"`, `"sharpen"`, ...)
  - `mask_size` — int
  - `sigma` — float
  - `blocks` — int
  - `threads` — int

Ejemplo con curl:
```bash
curl -X POST "http://localhost:8000/filtros/procesar_imagen" \
  -F "file=@/ruta/a/imagen.jpg" \
  -F "filtro=gaussiano" \
  -F "mask_size=3" \
  -F "sigma=1.0" \
  -F "blocks=128" \
  -F "threads=128"
```

Respuesta JSON esperada:
```json
{
  "imagen_original": "<base64 JPEG>",
  "imagen_filtro": "<base64 JPEG>",
  "filtro": "gaussiano",
  "tiempo": 0.034,
  "mask": 3,
  "sigma": 1.0,
  "blocks": 128,
  "threads": 128
}
```

- `imagen_original` y `imagen_filtro` son cadenas base64 que el frontend puede mostrar con:
  `src="data:image/jpeg;base64,<...>"`.
- `tiempo` está en segundos (float).

---

## Integración frontend (React + TypeScript)

Ejemplo de envío (usar exactamente las claves que espera el backend):
```ts
const formData = new FormData();
formData.append("file", file);
formData.append("filtro", filterType);
formData.append("mask_size", maskSize.toString());
formData.append("sigma", sigma.toString());
formData.append("blocks", blocks.toString());
formData.append("threads", threads.toString());

const res = await fetch("http://localhost:8000/filtros/procesar_imagen", {
  method: "POST",
  body: formData,
});
```

Al recibir la respuesta:
```ts
// data es el JSON recibido
imgOriginal.src = `data:image/jpeg;base64,${data.imagen_original}`;
imgFiltrada.src = `data:image/jpeg;base64,${data.imagen_filtro}`;
```

Muestra los demás metadatos (filtro, tiempo, mask, sigma, blocks, threads) en un panel legible.

## Ejecución con Docker

Estructura de archivos esperada para Docker
backend/
  Dockerfile
  requirements.txt
  app/
    main.py
    ...
frontend/
  Dockerfile
  .env
  src/
    App.tsx
docker-compose.yml

1. Archivo .env para Vite (frontend)

Esto te permite cambiar el nombre del contenedor y el puerto fácilmente.

.env

VITE_BACKEND_HOST=<tu-host-backend>
VITE_BACKEND_PORT=<tu-puerto-backend>

En tu código Vite:

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

2. Levantar toda la plataforma

docker compose up --build

Luego abre tu navegador en:

http://localhost:3000

El backend queda disponible en:

http://localhost:5000

3. Probar endpoint desde contenedor frontend

Vite usará:

fetch(`${import.meta.env.VITE_BACKEND_URL}/filtros/procesar_imagen`, ...)

