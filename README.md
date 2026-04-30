# 🎮 Servidor Minecraft Forge con Docker

Proyecto completo para ejecutar un servidor Minecraft Forge utilizando Docker Compose, incluye base de datos MySQL y panel web de control.

## 📋 Requisitos Previos

- Docker (v20.10+)
- Docker Compose (v1.29+)
- Mínimo 4GB de RAM disponible para el servidor
- Conexión a Internet para descargar imágenes y Forge

## 📁 Estructura del Proyecto

```
Minecraft-Dockers/
├── docker-compose.yml          # Configuración de servicios Docker
├── .env.example                # Variables de entorno (ejemplo)
├── .env                        # Variables de entorno (local)
├── README.md                   # Este archivo
│
├── minecraft-server/           # Servidor Minecraft Forge
│   ├── Dockerfile
│   ├── mods/                   # Directorio de mods
│   ├── config/                 # Configuración de mods
│   └── scripts/
│       └── entrypoint.sh       # Script de inicio
│
├── database/                   # Base de datos MySQL
│   └── init.sql               # Script de inicialización
│
├── web-panel/                 # Panel web de control
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       └── app.py
│
└── scripts/                   # Scripts auxiliares
    ├── backup.sh
    └── restore.sh
```

## 🚀 Inicio Rápido

### 1. Clonar y configurar

```bash
# Entrar al directorio del proyecto
cd Minecraft-Dockers

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus valores (opcional)
nano .env
```

### 2. Construir e iniciar los servicios

```bash
# Construir imágenes (primera vez)
docker compose build

# Iniciar servicios en segundo plano
docker compose up -d

# Ver logs
docker compose logs -f minecraft
```

### 3. Verificar estado

```bash
# Ver todos los servicios
docker compose ps

# Ver logs específicos
docker compose logs minecraft
docker compose logs mysql-db
docker compose logs web-panel
```

## ⚙️ Configuración

### Variables de Entorno

Edita el archivo `.env` para personalizar:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `MC_SERVER_NAME` | Nombre del servidor | Mi Servidor Forge |
| `MC_VERSION` | Versión de Minecraft | 1.20.1 |
| `FORGE_VERSION` | Versión de Forge | 47.2.0 |
| `MAX_PLAYERS` | Máximo de jugadores | 20 |
| `DIFFICULTY` | Dificultad (0-3) | 2 (Normal) |
| `JAVA_XMX` | Memoria máxima Java | 4G |
| `JAVA_XMS` | Memoria mínima Java | 2G |
| `RCON_PASSWORD` | Contraseña RCON | segura123 |

## 🌐 Playit.gg - Exponer Servidor en Internet

Para permitir que tus amigos se conecten sin port forwarding:

### 1. Habilitar Playit

Edita `.env`:
```bash
ENABLE_PLAYIT=true
```

Rebuild container:
```bash
docker compose build minecraft
docker compose up -d minecraft
```

### 2. Configurar Playit (Primera vez)

```bash
./scripts/playit-docker-setup.sh
```

El script te guiará por:
1. Abrir link en navegador
2. Vincular servidor a tu cuenta playit.gg
3. Configurar tunnel (puerto 25565)

### 3. Reiniciar y Obtener URL

```bash
docker compose restart minecraft
docker compose logs -f minecraft
```

Busca en logs:
```
🌐 Tu URL: play.playit.gg:XXXXX
```

### 4. Compartir con Amigos

Los jugadores conectan con:
- **Host**: `play.playit.gg`
- **Puerto**: El que te mostró playit.gg

### Opciones Avanzadas

**Ejecutar playit manualmente:**
```bash
./scripts/playit-docker-run.sh
```

**Ver logs de playit:**
```bash
docker compose logs -f minecraft | grep -i playit
```

**Resetear configuración:**
```bash
docker compose exec minecraft rm /etc/playit/playit.toml
./scripts/playit-docker-setup.sh
```

---

### Agregar Mods

```bash
# Copiar mods al directorio
cp tu_mod.jar minecraft-server/mods/

# Reiniciar el servidor
docker compose restart minecraft
```

### Configuración del Servidor

El archivo `server.properties` se genera automáticamente. Para personalizarlo:

```bash
# Acceder al contenedor
docker compose exec minecraft bash

# Editar propiedades
nano server.properties

# Reiniciar
exit
docker compose restart minecraft
```

## 🌐 Panel Web

El panel web está disponible en `http://localhost:8080`

### Endpoints de API

- `GET /` - Estado del panel
- `GET /health` - Health check
- `GET /api/players` - Lista de jugadores
- `GET /api/players/<uuid>` - Detalles de jugador
- `GET /api/server/stats` - Estadísticas del servidor
- `GET /api/logs` - Logs del servidor
- `GET /api/bans` - Lista de bans activos

## 🎮 Conectar al Servidor

### Local (misma red/WiFi)
1. Abre Minecraft Java Edition
2. Multiplayer → Direct Connection
3. Ingresa: `localhost:25565` o tu IP local (ej: `192.168.1.100:25565`)
4. ¡Disfruta!

### Internet Global (playit.gg) 🌐

**Opción recomendada para jugar desde cualquier lugar sin port forwarding:**

```bash
# Terminal 1: Iniciar servidor
docker compose up -d
docker compose logs -f minecraft

# Terminal 2: En otra ventana
./scripts/playit-setup.sh    # (solo primera vez)
./scripts/playit-run.sh
```

playit.gg te dará una URL como: `play.playit.gg:12345`

Los jugadores conectan a esa URL en Minecraft.

**Ventajas:**
- ✅ 100% Gratis
- ✅ Sin router/port forwarding
- ✅ URL estable
- ✅ Optimizado para gaming

Ver [TUNNELING.md](TUNNELING.md) para más detalles.

## 💾 Backup y Restauración

### Crear Backup

```bash
# Backup manual de datos
docker compose exec minecraft tar czf /backup_world_$(date +%Y%m%d_%H%M%S).tar.gz /minecraft/server/world

# Copiar backup a tu máquina
docker cp minecraft-server:/backup_*.tar.gz ./backups/
```

### Restaurar Backup

```bash
# Detener servidor
docker compose stop minecraft

# Restaurar datos
docker compose exec minecraft tar xzf /ruta/al/backup.tar.gz

# Reiniciar
docker compose start minecraft
```

## 🌐 Acceso Remoto (Tunneling)

Para exponer tu servidor a internet sin port forwarding:

### Opción 1: playit.gg (RECOMENDADO) ⭐
```bash
./scripts/playit-setup.sh    # Instalar (una sola vez)
./scripts/playit-run.sh      # Ejecutar en otra terminal
```
- 100% Gratuito
- Optimizado para gaming
- URL estable

### Opción 2: Ngrok
```bash
wget https://bin.equinox.io/c/4VmDzA7iaHg/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
./ngrok tcp 25565
```

Ver [TUNNELING.md](TUNNELING.md) para guía completa.

## 🛠️ Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Detener servicios
docker compose down

# Detener y limpiar volúmenes (CUIDADO)
docker compose down -v

# Escalar recursos
docker compose exec minecraft bash

# Ejecutar comando en el servidor (RCON)
docker compose exec minecraft rcon-cli command

# Verificar discos utilizados
docker compose exec minecraft du -sh /minecraft/server/*
```

## 📊 Monitoreo

### Ver consumo de recursos

```bash
docker stats
```

### Ver discos ocupados

```bash
docker system df
```

## 🐛 Troubleshooting

### El servidor no inicia

```bash
# Ver logs detallados
docker compose logs minecraft

# Verificar que Java está instalado
docker compose exec minecraft java -version

# Reiniciar el contenedor
docker compose restart minecraft
```

### Problema de memoria

```bash
# Aumentar memoria en .env
JAVA_XMX=8G
JAVA_XMS=4G

# Reiniciar
docker compose restart minecraft
```

### Base de datos no conecta

```bash
# Verificar estado de MySQL
docker compose logs mysql-db

# Reiniciar base de datos
docker compose restart mysql-db
```

## 📝 Notas Importantes

- **Permisos**: El proyecto usa usuarios no-root por seguridad
- **Almacenamiento**: Los datos persisten en volúmenes Docker
- **Seguridad**: Cambia las contraseñas en `.env` antes de usar en producción
- **Puertos**: Asegúrate que los puertos estén disponibles (25565, 3306, 8080)

## 🔗 Referencias Útiles

- [Forge Minecraft](https://files.minecraftforge.net/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [MySQL Docker](https://hub.docker.com/_/mysql)

## 📄 Licencia

Este proyecto es de código abierto. Minecraft es propiedad de Mojang Studios.

## ✨ Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias.

---

**¡Disfruta tu servidor Minecraft con Docker!** 🚀
