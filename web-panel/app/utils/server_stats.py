"""
Server Stats handler para compilar estadísticas del servidor
"""

import logging
from datetime import datetime
from typing import Dict, Any

logger = logging.getLogger(__name__)


class ServerStats:
    """Compila estadísticas del servidor desde DB y RCON"""
    
    def __init__(self, database, rcon_handler):
        self.db = database
        self.rcon = rcon_handler
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas completas del servidor"""
        try:
            stats = {
                'timestamp': datetime.utcnow().isoformat(),
                'players': self._get_players_stats(),
                'server': self._get_server_health(),
                'bans': self._get_bans_count()
            }
            return stats
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {
                'timestamp': datetime.utcnow().isoformat(),
                'error': str(e)
            }
    
    def _get_players_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de jugadores"""
        try:
            players = self.db.get_all_players()
            return {
                'total': len(players),
                'recent': players[:10] if players else [],
                'stats': self._calculate_player_stats(players)
            }
        except Exception as e:
            logger.error(f"Error getting player stats: {e}")
            return {'total': 0, 'error': str(e)}
    
    def _get_server_health(self) -> Dict[str, Any]:
        """Obtiene estado de salud del servidor"""
        try:
            server_info = self.rcon.get_server_info()
            return {
                'status': server_info.get('status', 'offline'),
                'info': server_info.get('info', ''),
                'database': 'connected' if self.db.is_connected() else 'disconnected'
            }
        except Exception as e:
            logger.error(f"Error getting server health: {e}")
            return {'status': 'offline', 'error': str(e)}
    
    def _get_bans_count(self) -> Dict[str, Any]:
        """Obtiene cuenta de bans"""
        try:
            bans = self.db.get_bans()
            return {
                'total': len(bans),
                'active': len([b for b in bans if b.get('is_permanent')])
            }
        except Exception as e:
            logger.error(f"Error getting bans: {e}")
            return {'total': 0, 'error': str(e)}
    
    def _calculate_player_stats(self, players: list) -> Dict[str, Any]:
        """Calcula estadísticas agregadas de jugadores"""
        if not players:
            return {
                'average_playtime': 0,
                'total_playtime': 0,
                'online_now': 0
            }
        
        total_playtime = sum(int(p.get('playtime', 0)) for p in players)
        online_count = sum(1 for p in players if p.get('status') == 'online')
        
        return {
            'average_playtime': total_playtime // len(players) if players else 0,
            'total_playtime': total_playtime,
            'online_now': online_count
        }
