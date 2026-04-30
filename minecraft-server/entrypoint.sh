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

# Iniciar playit.gg si está habilitado
if [ "${ENABLE_PLAYIT}" = "true" ]; then
    echo "🌐 Configurando playit.gg..."
    PLAYIT_CONFIG_DIR="/etc/playit/config"
    PLAYIT_SECRET="/etc/playit/playit.toml"

    mkdir -p "$PLAYIT_CONFIG_DIR"

    if [ ! -s "$PLAYIT_SECRET" ]; then
        echo "⚠️  playit.toml no encontrado."
        echo "   Setup manual: docker compose exec minecraft playit --secret_path /etc/playit/playit.toml setup"
    else
        echo "▶️  Ejecutando playit en background..."
        XDG_CONFIG_HOME="$PLAYIT_CONFIG_DIR" playit --secret_path "$PLAYIT_SECRET" --stdout start > /var/log/playit.log 2>&1 &
        PLAYIT_PID=$!
        echo "   PID: $PLAYIT_PID"
    fi
fi

echo ""

# Forge moderno suele generar run.sh y argumentos específicos de arranque.
if [ -f "./run.sh" ]; then
    chmod +x ./run.sh
    echo "Detectado run.sh, iniciando con launcher oficial de Forge..."
    echo ""
    exec ./run.sh
fi

# Fallback para versiones que arrancan directamente con JAR.
FORGE_JAR=$(ls -t forge-*.jar 2>/dev/null | head -1)

if [ -z "$FORGE_JAR" ]; then
    echo "ERROR: No se encontró run.sh ni forge-*.jar en $MINECRAFT_HOME"
    echo "Archivos disponibles:"
    ls -la
    exit 1
fi

echo "Usando JAR legacy: $FORGE_JAR"
echo ""

exec java -Xms$JAVA_XMS -Xmx$JAVA_XMX \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -Dusing_gui=false \
    -jar "$FORGE_JAR" nogui
