#!/bin/bash

# =============================================
# Script de Configuración Completa
# Minecraft + playit.gg
# =============================================

set -e

echo "🎮 Configurador Completo - Minecraft Forge + playit.gg"
echo "========================================================"
echo ""

# Paso 1: Setup básico
echo "📋 Paso 1: Configuración básica..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado"
else
    echo "⚠️  .env ya existe"
fi

# Paso 2: Hacer scripts ejecutables
echo "🔐 Paso 2: Preparando scripts..."
chmod +x scripts/*.sh
echo "✅ Scripts preparados"

# Paso 3: Crear directorios
echo "📁 Paso 3: Creando directorios..."
mkdir -p backups minecraft-server/mods minecraft-server/config playit
echo "✅ Directorios creados"

# Paso 4: Verificar Docker
echo "🐳 Paso 4: Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi
echo "✅ Docker instalado"

# Paso 5: Instalar playit.gg
echo "🌐 Paso 5: Instalando playit.gg..."
./scripts/playit-setup.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ CONFIGURACIÓN COMPLETADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1️⃣  Editar configuración:"
echo "   nano .env"
echo ""
echo "2️⃣  Construir e iniciar (Terminal 1):"
echo "   docker compose build"
echo "   docker compose up -d"
echo "   docker compose logs -f"
echo ""
echo "3️⃣  Exponer en internet (Terminal 2):"
echo "   ./scripts/playit-run.sh"
echo ""
echo "📖 Más info:"
echo "   - Servidor local: README.md"
echo "   - Tunneling: TUNNELING.md"
echo ""
