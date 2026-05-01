"""
Database handler para conexiones MySQL y consultas
"""

import uuid as uuid_lib
import mysql.connector
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class Database:
    """Gestiona conexiones y consultas a MySQL"""
    
    def __init__(self, host: str, user: str, password: str, database: str, port: int = 3306):
        self.config = {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'database': database
        }
        self.connection = None
        self._connect()
        self._migrate()
    
    def _connect(self):
        """Establece conexión a la base de datos"""
        try:
            self.connection = mysql.connector.connect(**self.config)
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            self.connection = None
    
    def _migrate(self):
        """Aplica migraciones a DBs existentes"""
        try:
            self.execute_update(
                "ALTER TABLE players ADD COLUMN IF NOT EXISTS is_op BOOLEAN DEFAULT 0"
            )
        except Exception as e:
            logger.warning(f"Migration warning: {e}")

    def is_connected(self) -> bool:
        """Verifica si la conexión está activa"""
        try:
            if self.connection:
                self.connection.ping()
                return True
        except:
            self._connect()
        return self.connection is not None
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """Ejecuta una consulta SELECT"""
        try:
            if not self.is_connected():
                return []
            
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            result = cursor.fetchall()
            cursor.close()
            return result
        except Exception as e:
            logger.error(f"Query error: {e}")
            return []
    
    def execute_update(self, query: str, params: tuple = None) -> bool:
        """Ejecuta INSERT, UPDATE o DELETE"""
        try:
            if not self.is_connected():
                return False
            
            cursor = self.connection.cursor()
            cursor.execute(query, params or ())
            self.connection.commit()
            cursor.close()
            return True
        except Exception as e:
            logger.error(f"Update error: {e}")
            self.connection.rollback()
            return False
    
    # ==================== PLAYERS ====================
    
    def get_all_players(self) -> List[Dict]:
        """Obtiene lista de todos los jugadores"""
        query = """
            SELECT id, uuid, username AS name, last_join,
                   total_playtime AS playtime, status, first_join AS created_at,
                   is_op
            FROM players
            ORDER BY last_join DESC
        """
        return self.execute_query(query)

    def get_player(self, uuid: str) -> Optional[Dict]:
        """Obtiene detalles de un jugador específico"""
        query = """
            SELECT id, uuid, username AS name, last_join,
                   total_playtime AS playtime, status, first_join AS created_at,
                   is_op
            FROM players
            WHERE uuid = %s
        """
        results = self.execute_query(query, (uuid,))
        return results[0] if results else None

    def get_player_by_name(self, name: str) -> Optional[Dict]:
        """Obtiene un jugador por nombre"""
        query = """
            SELECT id, uuid, username AS name, last_join,
                   total_playtime AS playtime, status, first_join AS created_at,
                   is_op
            FROM players
            WHERE username = %s
        """
        results = self.execute_query(query, (name,))
        return results[0] if results else None

    def set_player_op(self, uuid: str, is_op: bool) -> bool:
        """Actualiza el estado de operador de un jugador"""
        return self.execute_update(
            "UPDATE players SET is_op = %s WHERE uuid = %s",
            (1 if is_op else 0, uuid)
        )
    
    def sync_online_players(self, player_names: list) -> None:
        """Marca jugadores de la lista como online y todos los demás como offline"""
        try:
            self.execute_update("UPDATE players SET status = 'offline' WHERE status = 'online'")
            if not player_names:
                return
            now = datetime.now()
            for name in player_names:
                existing = self.get_player_by_name(name)
                if existing:
                    self.execute_update(
                        "UPDATE players SET status = 'online', last_join = %s WHERE username = %s",
                        (now, name)
                    )
                else:
                    self.execute_update(
                        "INSERT INTO players (uuid, username, status, first_join, last_join) VALUES (%s, %s, 'online', %s, %s)",
                        (str(uuid_lib.uuid4()), name, now, now)
                    )
        except Exception as e:
            logger.error(f"Error syncing online players: {e}")

    def ban_player(self, uuid: str, reason: str = "") -> bool:
        """Marca un jugador como baneado"""
        query = """
            INSERT INTO bans (uuid, username, reason, is_permanent, banned_at)
            SELECT uuid, username, %s, 1, NOW() FROM players WHERE uuid = %s
        """
        return self.execute_update(query, (reason, uuid))
    
    def unban_player(self, uuid: str) -> bool:
        """Desbanea un jugador"""
        query = """
            DELETE FROM bans WHERE uuid = %s
        """
        return self.execute_update(query, (uuid,))
    
    # ==================== LOGS ====================
    
    def get_logs(self, limit: int = 100, log_type: Optional[str] = None) -> List[Dict]:
        """Obtiene logs del servidor"""
        if log_type:
            query = """
                SELECT created_at AS timestamp, log_type AS level, message, log_type
                FROM server_logs
                WHERE log_type = %s
                ORDER BY created_at DESC
                LIMIT %s
            """
            return self.execute_query(query, (log_type, limit))
        else:
            query = """
                SELECT created_at AS timestamp, log_type AS level, message, log_type
                FROM server_logs
                ORDER BY created_at DESC
                LIMIT %s
            """
            return self.execute_query(query, (limit,))
    
    # ==================== BANS ====================
    
    def get_bans(self) -> List[Dict]:
        """Obtiene lista de bans activos"""
        query = """
            SELECT uuid, username AS name, reason, is_permanent, banned_at
            FROM bans
            WHERE is_permanent = 1 OR expires_at > NOW()
            ORDER BY banned_at DESC
        """
        return self.execute_query(query)
    
    def close(self):
        """Cierra la conexión"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
