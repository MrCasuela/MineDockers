# Frontend Minecraft Panel - React + Vite

## Descripción
Frontend moderno para el panel de control del servidor Minecraft con interfaz intuitiva y responsiva.

## Características
- ✅ Dashboard en tiempo real con estadísticas del servidor
- ✅ Gestión de jugadores (kick, ban, unban)
- ✅ Creación, restauración y eliminación de backups
- ✅ Visualización de logs del servidor
- ✅ Ejecutor de comandos RCON
- ✅ Gráficos y estadísticas
- ✅ Interfaz responsiva con Tailwind CSS
- ✅ Temas oscuro profesional

## Stack Tecnológico
- **React 18** - Librería de UI
- **Vite** - Build tool rápido
- **React Router** - Navegación
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Gráficos
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

## Instalación Local

### Requisitos
- Node.js 16+
- npm o yarn

### Pasos
```bash
# Instalar dependencias
npm install

# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Estructura del Proyecto
```
src/
├── components/        # Componentes reutilizables
│   ├── Layout.jsx    # Layout principal
│   ├── Modal.jsx     # Modal genérico
│   └── Common.jsx    # Componentes comunes
├── pages/            # Páginas principales
│   ├── Dashboard.jsx
│   ├── Players.jsx
│   ├── Backups.jsx
│   ├── Logs.jsx
│   └── Settings.jsx
├── services/         # Servicios API
│   └── api.js       # Cliente HTTP
├── store/           # State management
│   └── store.js     # Store Zustand
├── App.jsx          # App root
└── main.jsx         # Entry point
```

## Endpoints API Consumidos
- `GET /api/server/status` - Estado del servidor
- `GET /api/server/stats` - Estadísticas
- `POST /api/server/start|stop|restart` - Control del servidor
- `GET /api/players` - Lista de jugadores
- `POST /api/players/{uuid}/kick|ban` - Acciones sobre jugadores
- `GET /api/backups` - Lista de backups
- `POST /api/backups/create|restore` - Gestión de backups
- `DELETE /api/backups/{id}` - Eliminar backup
- `GET /api/logs` - Logs del servidor
- `POST /api/server/command` - Ejecutar comandos RCON

## Docker
```bash
# Build
docker build -f Dockerfile.frontend -t minecraft-frontend .

# Run
docker run -p 3000:3000 minecraft-frontend
```

## Desarrollo
- Cambios se reflejan en tiempo real con Vite
- HMR (Hot Module Replacement) habilitado
- ESLint configurado

## Variables de Entorno
Crear `.env` en la raíz del proyecto:
```
VITE_API_BASE=http://localhost:8080
```

## Licencia
MIT
