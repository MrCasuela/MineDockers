"""
RCON Handler para comunicación con servidor Minecraft
"""

import socket
import struct
import logging
import re
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class RconHandler:
    """Maneja conexión RCON con servidor Minecraft"""
    
    def __init__(self, host: str, port: int = 25575, password: str = ""):
        self.host = host
        self.port = port
        self.password = password
        self.socket = None
        self.authenticated = False
    
    def _send_packet(self, packet_type: int, payload: str) -> Optional[str]:
        """Envía un paquete RCON y recibe respuesta"""
        try:
            if not self.socket:
                self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.socket.connect((self.host, self.port))
            
            # Construir paquete RCON
            packet_id = 0
            packet_body = struct.pack('<i', packet_id) + struct.pack('<i', packet_type)
            packet_body += payload.encode('utf-8') + b'\x00' * 2
            packet = struct.pack('<i', len(packet_body)) + packet_body
            
            self.socket.sendall(packet)
            
            # Recibir respuesta
            response_length = struct.unpack('<i', self.socket.recv(4))[0]
            response = self.socket.recv(response_length).decode('utf-8', errors='ignore')
            response = response.rstrip('\x00')
            
            return response
        except Exception as e:
            logger.error(f"RCON packet error: {e}")
            self.socket = None
            self.authenticated = False
            return None
    
    def authenticate(self) -> bool:
        """Autentica con el servidor RCON"""
        try:
            response = self._send_packet(3, self.password)
            self.authenticated = response is not None
            return self.authenticated
        except Exception as e:
            logger.error(f"RCON authentication failed: {e}")
            return False
    
    def is_connected(self) -> bool:
        """Verifica si está conectado y autenticado"""
        if not self.authenticated:
            return self.authenticate()
        return True
    
    def execute_command(self, command: str) -> Optional[str]:
        """Ejecuta un comando en el servidor"""
        try:
            if not self.is_connected():
                return None
            
            response = self._send_packet(2, command)
            return response
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            return None
    
    def get_server_info(self) -> Dict[str, Any]:
        """Obtiene información del servidor (online, jugadores, etc)"""
        try:
            if not self.is_connected():
                return {'status': 'offline'}
            
            # Ejecutar comando para obtener info
            response = self.execute_command('list')
            
            if response:
                # Parsear respuesta "There are X of max Y players online: ..."
                return {
                    'status': 'online',
                    'info': response,
                    'tps': self.get_tps()
                }
            return {'status': 'offline'}
        except Exception as e:
            logger.error(f"Error getting server info: {e}")
            return {'status': 'offline'}

    def get_tps(self) -> Optional[float]:
        """Obtiene TPS desde comandos RCON si están disponibles"""
        try:
            if not self.is_connected():
                return None

            for command in ("forge tps", "tps"):
                response = self.execute_command(command)
                if not response:
                    continue

                tps_value = self._parse_tps(response)
                if tps_value is not None:
                    return tps_value
        except Exception as e:
            logger.error(f"Error getting TPS: {e}")
        return None

    def _parse_tps(self, response: str) -> Optional[float]:
        """Extrae un valor de TPS razonable desde la respuesta"""
        try:
            numbers = [float(n) for n in re.findall(r"\d+(?:\.\d+)?", response)]
            candidates = [n for n in numbers if 0 < n <= 20.5]
            if not candidates:
                return None
            return round(candidates[0], 2)
        except Exception as e:
            logger.error(f"Error parsing TPS: {e}")
            return None
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """Obtiene uso de memoria del servidor"""
        try:
            if not self.is_connected():
                return {'error': 'Not connected'}
            
            response = self.execute_command('info')
            return {
                'info': response,
                'timestamp': __import__('datetime').datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting memory: {e}")
            return {'error': str(e)}
    
    def stop_server(self, force: bool = False) -> str:
        """Detiene el servidor"""
        try:
            if force:
                return self.execute_command('stop') or "Stop command sent (force)"
            else:
                self.execute_command('say [PANEL] Server stopping in 10 seconds...')
                return self.execute_command('stop') or "Stop command sent"
        except Exception as e:
            logger.error(f"Error stopping server: {e}")
            return f"Error: {e}"
    
    def restart_server(self, delay: int = 10) -> str:
        """Reinicia el servidor con retraso opcional"""
        try:
            self.execute_command(f'say [PANEL] Server restarting in {delay} seconds...')
            self.execute_command('stop')
            return f"Restart initiated with {delay}s delay"
        except Exception as e:
            logger.error(f"Error restarting server: {e}")
            return f"Error: {e}"
    
    def kick_player(self, player_name: str, reason: str = "Kicked by admin") -> str:
        """Expulsa a un jugador"""
        try:
            command = f'kick {player_name} {reason}'
            return self.execute_command(command) or f"{player_name} kicked"
        except Exception as e:
            logger.error(f"Error kicking player: {e}")
            return f"Error: {e}"
    
    def ban_player(self, player_name: str, reason: str = "Banned by admin") -> str:
        """Banea a un jugador"""
        try:
            command = f'ban {player_name} {reason}'
            return self.execute_command(command) or f"{player_name} banned"
        except Exception as e:
            logger.error(f"Error banning player: {e}")
            return f"Error: {e}"
    
    def unban_player(self, player_name: str) -> str:
        """Desbanea a un jugador"""
        try:
            command = f'pardon {player_name}'
            return self.execute_command(command) or f"{player_name} unbanned"
        except Exception as e:
            logger.error(f"Error unbanning player: {e}")
            return f"Error: {e}"
    
    def close(self):
        """Cierra la conexión RCON"""
        if self.socket:
            self.socket.close()
            self.socket = None
            self.authenticated = False
