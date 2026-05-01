"""
Backup Handler para gestionar backups del servidor
"""

import os
import shutil
import logging
import subprocess
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class BackupHandler:
    """Gestiona creación, restauración y eliminación de backups"""
    
    def __init__(self, backup_dir: str):
        self.backup_dir = backup_dir
        self.server_dir = "/minecraft/server/world"  # Ruta del mundo en Docker
        
        # Crear directorio si no existe
        os.makedirs(self.backup_dir, exist_ok=True)
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """Lista todos los backups disponibles"""
        try:
            backups = []
            for filename in sorted(os.listdir(self.backup_dir), reverse=True):
                filepath = os.path.join(self.backup_dir, filename)
                if os.path.isfile(filepath):
                    stat = os.stat(filepath)
                    backups.append({
                        'id': filename,
                        'name': filename,
                        'created_at': datetime.utcfromtimestamp(stat.st_ctime).isoformat() + 'Z',
                        'size': stat.st_size,
                        'size_mb': round(stat.st_size / (1024 * 1024), 2)
                    })
            return backups
        except Exception as e:
            logger.error(f"Error listing backups: {e}")
            return []
    
    def create_backup(self, name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Crea un nuevo backup del servidor"""
        try:
            if not os.path.exists(self.server_dir):
                logger.error(f"World directory not found: {self.server_dir}")
                return None

            if not name:
                name = f"backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}.tar.gz"
            
            filepath = os.path.join(self.backup_dir, name)
            
            # Crear backup comprimido
            logger.info(f"Creating backup: {name}")
            
            # Usar tar para comprimir
            cmd = f"cd {os.path.dirname(self.server_dir)} && tar -czf {filepath} {os.path.basename(self.server_dir)}"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode != 0:
                logger.error(f"Backup creation failed: {result.stderr}")
                return None
            
            stat = os.stat(filepath)
            backup_info = {
                'id': name,
                'name': name,
                'created_at': datetime.utcnow().isoformat() + 'Z',
                'size': stat.st_size,
                'size_mb': round(stat.st_size / (1024 * 1024), 2)
            }
            
            logger.info(f"Backup created successfully: {name}")
            return backup_info
        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            return None
    
    def restore_backup(self, backup_id: str, force: bool = False) -> Dict[str, Any]:
        """Restaura un backup específico"""
        try:
            filepath = os.path.join(self.backup_dir, backup_id)
            
            if not os.path.exists(filepath):
                return {'error': 'Backup not found', 'success': False}

            if not os.path.exists(self.server_dir):
                return {'error': 'World directory not found', 'success': False}
            
            logger.info(f"Restoring backup: {backup_id}")
            
            # Crear respaldo de seguridad del mundo actual
            if os.path.exists(self.server_dir):
                safety_backup = os.path.join(self.backup_dir, f"pre-restore-{datetime.now().strftime('%Y%m%d-%H%M%S')}.tar.gz")
                cmd = f"cd {os.path.dirname(self.server_dir)} && tar -czf {safety_backup} {os.path.basename(self.server_dir)}"
                subprocess.run(cmd, shell=True)
            
            # Restaurar backup
            cmd = f"cd {os.path.dirname(self.server_dir)} && tar -xzf {filepath}"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode != 0:
                logger.error(f"Restore failed: {result.stderr}")
                return {'error': 'Restore failed', 'success': False, 'details': result.stderr}
            
            logger.info(f"Backup restored: {backup_id}")
            return {
                'success': True,
                'message': f'Backup {backup_id} restored successfully',
                'restored_at': datetime.utcnow().isoformat() + 'Z'
            }
        except Exception as e:
            logger.error(f"Error restoring backup: {e}")
            return {'error': str(e), 'success': False}
    
    def delete_backup(self, backup_id: str) -> Dict[str, Any]:
        """Elimina un backup específico"""
        try:
            filepath = os.path.join(self.backup_dir, backup_id)
            
            if not os.path.exists(filepath):
                return {'error': 'Backup not found', 'success': False}
            
            logger.info(f"Deleting backup: {backup_id}")
            os.remove(filepath)
            
            logger.info(f"Backup deleted: {backup_id}")
            return {
                'success': True,
                'message': f'Backup {backup_id} deleted'
            }
        except Exception as e:
            logger.error(f"Error deleting backup: {e}")
            return {'error': str(e), 'success': False}
    
    def get_backup_info(self, backup_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene información de un backup específico"""
        try:
            filepath = os.path.join(self.backup_dir, backup_id)
            
            if not os.path.exists(filepath):
                return None
            
            stat = os.stat(filepath)
            return {
                'id': backup_id,
                'name': backup_id,
                'created_at': datetime.utcfromtimestamp(stat.st_ctime).isoformat() + 'Z',
                'size': stat.st_size,
                'size_mb': round(stat.st_size / (1024 * 1024), 2)
            }
        except Exception as e:
            logger.error(f"Error getting backup info: {e}")
            return None
