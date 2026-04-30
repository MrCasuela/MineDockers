#!/bin/bash

# =============================================
# Script para ejecutar playit.gg en Docker
# =============================================

set -e

echo "🌐 Iniciando playit.gg"
echo "======================"
echo ""

# Verificar si el container está corriendo
if ! docker compose ps minecraft | grep -q "minecraft.*Up"; then
    echo "❌ Container minecraft no está corriendo"
    echo "   Ejecuta primero: docker compose up -d"
    exit 1
fi

# Verificar si playit.toml existe
if ! docker compose exec minecraft [ -s /etc/playit/playit.toml ]; then
    echo "❌ playit.toml no configurado"
    echo "   Ejecuta primero: ./scripts/playit-docker-setup.sh"
    exit 1
fi

echo "🎮 Puerto local objetivo: localhost:25565"
echo "⏳ Esperando conexión a playit.gg..."
echo ""
echo "💡 Tu URL será mostrada por playit.gg"
echo "   Los jugadores podrán conectarse a esa URL"
echo ""
echo "⚠️  Presiona Ctrl+C para detener"
echo ""

# Ejecutar playit en foreground
docker compose exec minecraft bash -c \
    'XDG_CONFIG_HOME=/etc/playit/config playit --secret_path /etc/playit/playit.toml --stdout start'
