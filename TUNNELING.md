# 🌐 Guía de Tunneling - playit.gg

Este documento explica cómo usar **playit.gg** para exponer tu servidor Minecraft en internet sin necesidad de port forwarding.

## 🎯 ¿Por qué playit.gg?

| Característica | Ventaja |
|---|---|
| **100% Gratuito** | Sin limitaciones ni pagos mensuales |
| **Optimizado para Gaming** | Latencia baja, ideal para Minecraft |
| **URL Estable** | Los jugadores usan siempre la misma URL |
| **Sin Router** | No necesitas acceso al router |
| **Automático** | Un comando y ¡listo! |

## 📥 Instalación

### 🐳 Opción 1: Con Docker (RECOMENDADO)

Si estás usando Docker Compose, playit.gg ya está integrado en el container:

```bash
# 1. En el archivo .env, establece:
ENABLE_PLAYIT=true

# 2. Rebuilda la imagen (solo primera vez)
docker compose build minecraft

# 3. Inicia los servicios
docker compose up -d
```

El container ejecutará playit automáticamente. Ver logs:
```bash
docker compose logs -f minecraft
```

**Ventajas:**
- ✅ Playit integrado en el container
- ✅ Se inicia automáticamente
- ✅ Configuración persistente en volumen
- ✅ Sin scripts adicionales

**Nota:** La primera vez que ejecutes `ENABLE_PLAYIT=true`, necesitarás hacer setup interactivo. Puedes hacerlo:
```bash
# Opción A: Dentro del container (recomendado)
docker compose exec minecraft playit --secret_path /etc/playit/playit.toml setup

# Opción B: En el archivo docker-compose.yml, temporal
# Comenta "exec ./run.sh" y ejecuta setup, luego descomenta
```

### Opción 2: Script Automático (Local, sin Docker)

```bash
# Descargar e instalar playit.gg
./scripts/playit-setup.sh
```

Este script:
- ✅ Detecta tu SO y arquitectura
- ✅ Descarga la versión correcta
- ✅ Prepara todo

### Opción 3: Manual

```bash
# Linux x64
wget https://playit.gg/downloads/playit-linux-x64
chmod +x playit-linux-x64

# Linux ARM64
wget https://playit.gg/downloads/playit-linux-arm64
chmod +x playit-linux-arm64

# macOS
wget https://playit.gg/downloads/playit-macos-x64
chmod +x playit-macos-x64
```

## 🚀 Uso

### Paso 1: Iniciar el servidor Minecraft

```bash
docker compose up -d minecraft
docker compose logs -f minecraft
```

Espera a que diga "Done" (puede tardar minutos en primer inicio).

### Paso 2: Ejecutar playit.gg

En otra terminal:

```bash
./scripts/playit-run.sh
```

O con puerto personalizado:

```bash
./scripts/playit-run.sh 25565
```

### Paso 3: Obtener URL

playit.gg mostrará algo como:

```
🎮 Your server is online!
🌐 URL: play.playit.gg:12345
```

### Paso 4: Compartir con amigos

Los jugadores conectan con:
- **Host**: `play.playit.gg`
- **Puerto**: `12345` (el que te mostró playit.gg)

## 📊 Ejemplo Completo

**Terminal 1 - Servidor:**
```bash
cd Minecraft-Dockers
docker compose up -d
docker compose logs -f minecraft
```

**Terminal 2 - Tunneling:**
```bash
cd Minecraft-Dockers
./scripts/playit-setup.sh  # (solo primera vez)
./scripts/playit-run.sh
```

**Resultado:**
```
✅ Servidor corriendo en localhost:25565
✅ Expuesto globalmente en play.playit.gg:XXXXX
✅ Amigos pueden conectarse desde cualquier lugar
```

## 🔧 Opciones Avanzadas

### Ejecutar playit.gg en Background

```bash
nohup ./scripts/playit-run.sh > playit.log 2>&1 &
```

Ver logs:
```bash
tail -f playit.log
```

### Múltiples Puertos

Si tienes varios servicios:

```bash
# Terminal A - Minecraft
./scripts/playit-run.sh 25565

# Terminal B - Panel Web
./scripts/playit-run.sh 8080
```

### Script Integrado (Ambos Servicios)

```bash
#!/bin/bash

# Iniciar servidor Minecraft
docker compose up -d minecraft mysql-db web-panel

# Esperar a que esté listo
sleep 30

# Ejecutar playit en background
./scripts/playit-run.sh 25565 &
PLAYIT_PID=$!

echo "✅ Servidor y playit.gg iniciados"
echo "PID de playit: $PLAYIT_PID"

# Mantener activo
wait $PLAYIT_PID
```

## ⚠️ Limitaciones y Consideraciones

### Limitaciones de playit.gg (Plan Gratuito)
- Ancho de banda: Generoso (más que suficiente para Minecraft)
- Conexiones simultáneas: Ilimitadas
- Tiempo de actividad: Limitado (desactiva si no hay conexiones)

### Performance
- **Latencia**: +10-50ms extra (aceptable para Minecraft)
- **Velocidad**: Limitada principalmente por tu conexión de internet
- **Estabilidad**: Muy buena (99.9% uptime)

## 🎮 Alternativas

Si playit.gg no funciona:

### Ngrok
```bash
# Instalar
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok-stable-linux-x64.zip | unzip -
./ngrok tcp 25565
```

### Cloudflare Tunnel
```bash
# Instalar cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

cloudflared tunnel --url tcp://localhost:25565
```

## 🆘 Troubleshooting

### "Error: playit not found"
```bash
# Asegúrate de que está descargado
ls -la playit/
# Si no existe:
./scripts/playit-setup.sh
```

### "Connection refused"
```bash
# Verifica que el servidor Minecraft está corriendo
docker compose ps
docker compose logs minecraft
```

### "Latencia muy alta"
- Verifica tu conexión de internet
- Prueba con otro servidor playit.gg (cambia región)
- Considera usar port forwarding si es crítico

### "URL cambia constantemente"
- Usa playit.gg gratis (URL estable con sesión)
- La URL cambia si cierras playit y lo reabre

## 📚 Referencias

- [Sitio Web playit.gg](https://playit.gg)
- [Documentación oficial](https://playit.gg/docs)
- [Comunidad Discord](https://discord.gg/playit)

---

¿Dudas? Revisa `docker compose logs` y `playit.log` para más detalles.
