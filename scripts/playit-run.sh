#!/bin/bash

# =============================================
# Script para ejecutar playit.gg
# =============================================

set -e

PLAYIT_DIR="./playit"
PORT=${1:-25565}

# Detectar arquitectura
OS_TYPE=$(uname -s)
ARCH=$(uname -m)
if [ "$OS_TYPE" = "Linux" ]; then
    if [ "$ARCH" = "x86_64" ]; then
        PLAYIT_BIN="playit-linux-amd64"
    elif [ "$ARCH" = "aarch64" ]; then
        PLAYIT_BIN="playit-linux-aarch64"
    elif [ "$ARCH" = "armv7l" ]; then
        PLAYIT_BIN="playit-linux-armv7"
    elif [ "$ARCH" = "i686" ] || [ "$ARCH" = "i386" ]; then
        PLAYIT_BIN="playit-linux-i686"
    else
        echo "❌ Arquitectura no soportada: $ARCH"
        exit 1
    fi
else
    echo "❌ playit.gg solo soportado por este script en Linux"
    exit 1
fi

PLAYIT_PATH="$PLAYIT_DIR/$PLAYIT_BIN"

# Verificar si playit está descargado
if [ ! -f "$PLAYIT_PATH" ]; then
    echo "❌ playit.gg no está instalado"
    echo "Ejecuta primero: ./scripts/playit-setup.sh"
    exit 1
fi

echo "🌐 Iniciando playit.gg"
echo "=================="
echo ""
echo "🎮 Puerto local objetivo: localhost:$PORT"
echo "⏳ Esperando conexión a playit.gg..."
echo ""
echo "💡 Tu URL será mostrada por playit.gg"
echo "   Los jugadores podrán conectarse a esa URL"
echo ""
echo "⚠️  Presiona Ctrl+C para detener"
echo ""

SECRET_PATH="${PLAYIT_DIR}/playit.toml"
PLAYIT_CONFIG_DIR="${PLAYIT_DIR}/config"
mkdir -p "$(dirname "$SECRET_PATH")" "$PLAYIT_CONFIG_DIR"

if [ ! -s "$SECRET_PATH" ]; then
    echo "ℹ️  Primer inicio: se requiere vincular este agente."
    echo "   Sigue el asistente de playit para crear el tunnel (TCP 25565)."
    XDG_CONFIG_HOME="$PLAYIT_CONFIG_DIR" "$PLAYIT_PATH" --secret_path "$SECRET_PATH" setup
fi

# Ejecutar playit
XDG_CONFIG_HOME="$PLAYIT_CONFIG_DIR" "$PLAYIT_PATH" --secret_path "$SECRET_PATH" --stdout start
