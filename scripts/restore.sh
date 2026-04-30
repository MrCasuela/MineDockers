#!/bin/bash

# =============================================
# Script de Restauración - Servidor Minecraft
# =============================================

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Debes especificar el archivo de backup"
    echo "Uso: ./restore.sh <archivo_backup.tar.gz>"
    echo ""
    echo "Backups disponibles:"
    ls -lh ./backups/*.tar.gz 2>/dev/null || echo "No hay backups"
    exit 1
fi

BACKUP_FILE="$1"
MINECRAFT_CONTAINER="minecraft-server"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ El archivo $BACKUP_FILE no existe"
    exit 1
fi

echo "🎮 Iniciando restauración del servidor Minecraft..."
echo "📦 Archivo: $BACKUP_FILE"
echo ""

# Detener el servidor
echo "⏹️  Deteniendo servidor..."
docker compose stop minecraft

echo "🔄 Restaurando datos..."
cat "$BACKUP_FILE" | docker compose exec -T minecraft tar xzf - -C /

echo "🚀 Reiniciando servidor..."
docker compose start minecraft

echo "✅ Restauración completada"
echo ""
echo "💡 Verifica los logs con: docker compose logs -f minecraft"
