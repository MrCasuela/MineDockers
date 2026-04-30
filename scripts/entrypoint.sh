#!/bin/bash

# Configuración simplificada del servidor Minecraft Forge

MINECRAFT_HOME="/minecraft/server"
cd "$MINECRAFT_HOME" || exit 1

# Configurar EULA
echo "eula=true" > eula.txt

# Crear server.properties si no existe
if [ ! -f "server.properties" ]; then
    echo "Creando server.properties..."
    cat > server.properties <<EOF
server-name=${SERVER_NAME:-Minecraft Forge Server}
server-port=${SERVER_PORT:-25565}
rcon.port=${RCON_PORT:-25575}
rcon.password=${RCON_PASSWORD:-changeme}
enable-rcon=true
max-players=${MAX_PLAYERS:-20}
difficulty=${DIFFICULTY:-2}
gamemode=${GAMEMODE:-0}
motd=${SERVER_NAME:-Minecraft Forge Server}
online-mode=true
pvp=true
enable-command-blocks=true
spawn-protection=16
view-distance=10
EOF
fi

# Variables de memoria - sin comillas para que se expandan correctamente
JAVA_XMS=${JAVA_XMS:-2G}
JAVA_XMX=${JAVA_XMX:-4G}

echo "================================================"
echo "🎮 Iniciando Servidor Minecraft Forge"
echo "================================================"
echo "Memoria: $JAVA_XMS - $JAVA_XMX"
echo "Puerto: ${SERVER_PORT:-25565}"
echo "Max Jugadores: ${MAX_PLAYERS:-20}"
echo "================================================"
echo ""

# Ejecutar servidor Forge
# Detectar archivo JAR de Forge
FORGE_JAR=$(ls -t forge-*.jar 2>/dev/null | head -1)

if [ -z "$FORGE_JAR" ]; then
    echo "ERROR: No se encontró forge-*.jar en $MINECRAFT_HOME"
    echo "Archivos disponibles:"
    ls -la
    exit 1
fi

echo "Usando: $FORGE_JAR"
echo ""

# Ejecutar con parámetros de Java simplificados (compatible con cualquier versión)
exec java -Xms$JAVA_XMS -Xmx$JAVA_XMX \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Dusing_gui=false \
  -jar "$FORGE_JAR" nogui
