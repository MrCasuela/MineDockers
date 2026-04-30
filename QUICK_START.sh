#!/bin/bash

# Quick Start Script para Minecraft Panel v2.0
# Uso: bash QUICK_START.sh

echo "🚀 Minecraft Panel v2.0 - Quick Start"
echo "====================================="
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "Por favor instala Docker desde: https://docker.com"
    exit 1
fi

# Verificar si docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose no está instalado"
    echo "Por favor instala Docker Compose"
    exit 1
fi

echo "✅ Docker y docker-compose encontrados"
echo ""

# Crear .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando .env desde .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env creado. Por favor edítalo con tus valores:"
        echo "   - RCON_PASSWORD"
        echo "   - MC_SERVER_NAME"
        echo "   - Otros valores según necesites"
        echo ""
        read -p "¿Presiona Enter cuando hayas editado .env..."
    else
        echo "❌ No se encontró .env.example"
        exit 1
    fi
else
    echo "✅ .env ya existe"
fi

echo ""
echo "🔨 Construyendo imágenes Docker..."
docker-compose build --no-cache

echo ""
echo "🚀 Iniciando servicios..."
docker-compose up -d

echo ""
echo "⏳ Esperando a que los servicios se inicien..."
sleep 10

echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo "✅ ¡Panel Minecraft v2.0 iniciado!"
echo ""
echo "🌐 Acceso:"
echo "   • Frontend:  http://localhost:3000"
echo "   • API:       http://localhost:8080"
echo "   • Servidor:  localhost:25565"
echo "   • MySQL:     localhost:3306"
echo ""
echo "📚 Documentación:"
echo "   • Guía de uso:  cat FRONTEND_GUIDE.md"
echo "   • Cambios:      cat CHANGES.md"
echo ""
echo "🔍 Útil:"
echo "   • Ver logs:    docker-compose logs -f"
echo "   • Parar:       docker-compose down"
echo "   • Reiniciar:   docker-compose restart"
echo ""
