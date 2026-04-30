#!/bin/bash

# =============================================
# Script de Setup - playit.gg en Docker
# =============================================

set -e

echo "🎮 Configurador de playit.gg para Minecraft (Docker)"
echo "====================================================="
echo ""

# Verificar si el container está corriendo
if ! docker compose ps minecraft | grep -q "minecraft.*Up"; then
    echo "❌ Container minecraft no está corriendo"
    echo "   Ejecuta primero: docker compose up -d"
    exit 1
fi

echo "🔧 Iniciando configuración de playit.gg..."
echo ""

# Verificar si ya existe playit.toml
if docker compose exec minecraft [ -s /etc/playit/playit.toml ]; then
    echo "✅ playit.toml ya configurado"
    echo "   Para cambiar configuración, elimina el archivo:"
    echo "   docker compose exec minecraft rm /etc/playit/playit.toml"
    exit 0
fi

echo "⏳ Ejecutando playit setup (interactivo)..."
echo ""
echo "📋 Pasos:"
echo "   1. Se abrirá playit.gg en tu navegador"
echo "   2. Vincula tu servidor a tu cuenta"
echo "   3. Configura el tunnel (puerto 25565)"
echo "   4. Los cambios se guardarán automáticamente"
echo ""

# Ejecutar setup interactivo
docker compose exec minecraft bash -c \
    'XDG_CONFIG_HOME=/etc/playit/config playit --secret_path /etc/playit/playit.toml setup'

echo ""
echo "=================================================="
echo "✨ Configuración completada"
echo "=================================================="
echo ""
echo "🎯 Próximos pasos:"
echo "   1. docker compose restart minecraft"
echo "   2. docker compose logs -f minecraft"
echo "   3. Busca la URL de playit en los logs"
echo ""
