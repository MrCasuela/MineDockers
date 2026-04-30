#!/bin/bash

# =============================================
# Script de Configuración - playit.gg
# =============================================

set -e

echo "🎮 Configurador de playit.gg para Minecraft"
echo "==========================================="
echo ""

# Detectar sistema operativo
OS_TYPE=$(uname -s)
ARCH=$(uname -m)

PLAYIT_VERSION="0.17.1"

echo "🖥️  Sistema: $OS_TYPE ($ARCH)"
echo ""

# Crear directorio para playit si no existe
PLAYIT_DIR="./playit"
mkdir -p "$PLAYIT_DIR"

download_playit() {
    local url="$1"
    local output="$2"

    if curl -L -A "Mozilla/5.0" -H "Accept: application/octet-stream" "$url" -o "$output"; then
        return 0
    fi

    return 1
}

validate_binary() {
    local file_path="$1"

    if ! command -v file >/dev/null 2>&1; then
        return 0
    fi

    if file "$file_path" | grep -qi "HTML"; then
        return 1
    fi

    return 0
}

# Descargar playit según el sistema
if [ "$OS_TYPE" = "Linux" ]; then
    if [ "$ARCH" = "x86_64" ]; then
        PLAYIT_URL="https://builds.playit.gg/${PLAYIT_VERSION}/playit-linux-amd64"
        PLAYIT_BIN="playit-linux-amd64"
    elif [ "$ARCH" = "aarch64" ]; then
        PLAYIT_URL="https://builds.playit.gg/${PLAYIT_VERSION}/playit-linux-aarch64"
        PLAYIT_BIN="playit-linux-aarch64"
    elif [ "$ARCH" = "armv7l" ]; then
        PLAYIT_URL="https://builds.playit.gg/${PLAYIT_VERSION}/playit-linux-armv7"
        PLAYIT_BIN="playit-linux-armv7"
    elif [ "$ARCH" = "i686" ] || [ "$ARCH" = "i386" ]; then
        PLAYIT_URL="https://builds.playit.gg/${PLAYIT_VERSION}/playit-linux-i686"
        PLAYIT_BIN="playit-linux-i686"
    else
        echo "❌ Arquitectura no soportada: $ARCH"
        exit 1
    fi
elif [ "$OS_TYPE" = "Darwin" ]; then
    echo "❌ playit.gg no tiene binarios oficiales para macOS actualmente."
    echo "Visita: https://playit.gg/download/macos"
    exit 1
else
    echo "❌ Sistema operativo no soportado: $OS_TYPE"
    exit 1
fi

echo "📥 Descargando playit.gg..."
if ! download_playit "$PLAYIT_URL" "$PLAYIT_DIR/$PLAYIT_BIN"; then
    echo "❌ Error al descargar playit.gg"
    echo "Intenta descargar manualmente desde: https://playit.gg/download/linux"
    exit 1
fi

if ! validate_binary "$PLAYIT_DIR/$PLAYIT_BIN"; then
    echo "❌ Descarga inválida (se recibió HTML en lugar del binario)"
    echo "Reintenta o descarga manualmente desde: https://playit.gg/download/linux"
    rm -f "$PLAYIT_DIR/$PLAYIT_BIN"
    exit 1
fi

# Hacer ejecutable
chmod +x "$PLAYIT_DIR/$PLAYIT_BIN"
echo "✅ playit.gg descargado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Configuración completada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Para ejecutar playit.gg:"
echo "  ./scripts/playit-run.sh"
echo ""
echo "💡 Esto expondrá tu servidor en internet sin necesidad de:"
echo "  - Port forwarding en el router"
echo "  - IP pública fija"
echo "  - DDNS"
echo ""
echo "🎯 Los jugadores usarán la URL que te dé playit.gg"
echo ""
