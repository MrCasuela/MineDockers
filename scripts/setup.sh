#!/bin/bash

# =============================================
# Script de Configuración Inicial
# =============================================

set -e

echo "🎮 Configurador del Servidor Minecraft Forge"
echo "==========================================="
echo ""

# Verificar si .env existe
if [ ! -f ".env" ]; then
    echo "📋 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo "⚠️  Por favor, edita el archivo .env con tus configuraciones"
    echo ""
fi

# Hacer scripts ejecutables
echo "🔐 Haciendo scripts ejecutables..."
chmod +x scripts/*.sh

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p backups minecraft-server/mods minecraft-server/config

# Verificar Docker
echo "🐳 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

echo "✅ Docker está instalado"
echo ""

# Mostrar resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Configuración inicial completada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Pasos siguientes:"
echo "1. Edita .env con tus configuraciones"
echo "2. Ejecuta: docker compose build"
echo "3. Ejecuta: docker compose up -d"
echo "4. Verifica con: docker compose logs -f"
echo ""
echo "🌐 Panel web en: http://localhost:8080"
echo "🎮 Servidor en: localhost:25565"
echo ""
