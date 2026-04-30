#!/bin/bash

# =============================================
# Script de Backup - Servidor Minecraft Forge
# =============================================

set -e

BACKUP_DIR="./backups"
MINECRAFT_CONTAINER="minecraft-server"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/minecraft_backup_$TIMESTAMP.tar.gz"

echo "🎮 Iniciando backup del servidor Minecraft..."
echo "📅 Timestamp: $TIMESTAMP"
echo ""

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Copiar datos del contenedor
echo "📦 Comprimiendo datos del servidor..."
docker compose exec -T minecraft tar czf - /minecraft/server/world > "$BACKUP_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Backup completado: $BACKUP_FILE"
echo "📊 Tamaño: $FILE_SIZE"
echo ""

# Limpiar backups antiguos (mantener últimos 7)
echo "🧹 Limpiando backups antiguos..."
ls -t "$BACKUP_DIR"/minecraft_backup_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm
echo "✅ Limpieza completada"
