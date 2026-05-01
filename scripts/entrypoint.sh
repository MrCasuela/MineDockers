#!/bin/bash

# Configuración simplificada del servidor Minecraft Forge

MINECRAFT_HOME="/minecraft/server"
cd "$MINECRAFT_HOME" || exit 1

# Configurar EULA
echo "eula=true" > eula.txt

# Determinar formato de difficulty/gamemode según versión de MC
# Pre-1.13 usa números; 1.13+ usa texto
MC_MINOR=$(echo "${MC_VERSION:-1.20.1}" | cut -d. -f2)
if [ "$MC_MINOR" -lt 13 ] 2>/dev/null; then
    # Convertir texto → número para versiones antiguas
    case "${DIFFICULTY:-normal}" in
        peaceful) DIFF_VAL=0 ;;
        easy)     DIFF_VAL=1 ;;
        normal)   DIFF_VAL=2 ;;
        hard)     DIFF_VAL=3 ;;
        *)        DIFF_VAL="${DIFFICULTY:-2}" ;;  # ya es número
    esac
    case "${GAMEMODE:-survival}" in
        survival)   GAME_VAL=0 ;;
        creative)   GAME_VAL=1 ;;
        adventure)  GAME_VAL=2 ;;
        spectator)  GAME_VAL=3 ;;
        *)          GAME_VAL="${GAMEMODE:-0}" ;;  # ya es número
    esac
else
    DIFF_VAL="${DIFFICULTY:-normal}"
    GAME_VAL="${GAMEMODE:-survival}"
fi

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
difficulty=$DIFF_VAL
gamemode=$GAME_VAL
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
if [ "${SERVER_TYPE:-forge}" = "vanilla" ]; then
    echo "🎮 Iniciando Servidor Minecraft Vanilla"
else
    echo "🎮 Iniciando Servidor Minecraft Forge"
fi
echo "================================================"
echo "Memoria: $JAVA_XMS - $JAVA_XMX"
echo "Puerto: ${SERVER_PORT:-25565}"
echo "Max Jugadores: ${MAX_PLAYERS:-20}"
echo "================================================"
echo ""

# Detectar JAR según SERVER_TYPE
if [ "${SERVER_TYPE:-forge}" = "vanilla" ]; then
    SERVER_JAR=$(ls -t minecraft_server*.jar 2>/dev/null | head -1)
    JAR_LABEL="Vanilla"
else
    SERVER_JAR=$(ls -t forge-*.jar 2>/dev/null | head -1)
    JAR_LABEL="Forge"
fi

if [ -z "$SERVER_JAR" ]; then
    echo "ERROR: No se encontró JAR de $JAR_LABEL en $MINECRAFT_HOME"
    echo "Archivos disponibles:"
    ls -la
    exit 1
fi

echo "Usando ($JAR_LABEL): $SERVER_JAR"
echo ""

# Ejecutar con parámetros de Java simplificados (compatible con cualquier versión)
exec java -Xms$JAVA_XMS -Xmx$JAVA_XMX \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Dusing_gui=false \
  -jar "$SERVER_JAR" nogui
