"""
Minecraft Server Panel - Flask Backend API v2.0
Maneja estadísticas del servidor, logs, jugadores y control remoto RCON
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
import logging
from datetime import datetime
from dotenv import load_dotenv

# Importar módulos personalizados
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.database import Database
from utils.rcon_handler import RconHandler
from utils.server_stats import ServerStats
from utils.backup_handler import BackupHandler
from utils.docker_client import DockerClient

# Configuración
load_dotenv()
app = Flask(__name__)
CORS(app)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar módulos
db = Database(
    host=os.getenv('DB_HOST', 'mysql-db'),
    user=os.getenv('DB_USER', 'minecraft_user'),
    password=os.getenv('DB_PASSWORD', 'minecraft_password'),
    database=os.getenv('DB_NAME', 'minecraft_db')
)

rcon = RconHandler(
    host=os.getenv('MC_HOST', 'minecraft'),
    port=int(os.getenv('RCON_PORT', 25575)),
    password=os.getenv('RCON_PASSWORD', '')
)

server_stats = ServerStats(db, rcon)
backup_handler = BackupHandler(os.getenv('BACKUP_DIR', '/backups'))
docker_client = DockerClient()


# ==================== HEALTH & INFO ====================

@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    """Verifica el estado del panel y sus conexiones"""
    status = {
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0',
        'connections': {
            'database': db.is_connected(),
            'rcon': rcon.is_connected()
        }
    }
    return jsonify(status), 200 if status['connections']['database'] else 503



# ==================== SERVER STATS ====================

@app.route('/api/server/stats', methods=['GET'])
def get_server_stats():
    """Obtiene estadísticas del servidor"""
    try:
        stats = server_stats.get_stats()
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error getting server stats: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/server/info', methods=['GET'])
def get_server_info():
    """Retorna info estática del servidor: versiones desde env"""
    return jsonify({
        'mc_version': os.getenv('MC_VERSION', 'unknown'),
        'forge_version': os.getenv('FORGE_VERSION', 'unknown'),
        'server_port': os.getenv('MC_PORT', '25565'),
        'rcon_port': os.getenv('MC_RCON_PORT', '25575'),
    }), 200


@app.route('/api/server/status', methods=['GET'])
def get_server_status():
    """Obtiene estado actual del servidor (online/offline, jugadores, etc)"""
    try:
        status = rcon.get_server_info()
        return jsonify(status), 200
    except Exception as e:
        logger.error(f"Error getting server status: {e}")
        return jsonify({'error': str(e), 'status': 'offline'}), 200


@app.route('/api/server/memory', methods=['GET'])
def get_server_memory():
    """Obtiene uso de memoria del servidor"""
    try:
        memory = docker_client.get_memory_usage()
        if memory:
            return jsonify(memory), 200

        fallback = rcon.get_memory_usage()
        return jsonify(fallback), 200
    except Exception as e:
        logger.error(f"Error getting memory: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== SERVER CONTROL ====================

@app.route('/api/server/start', methods=['POST'])
def start_server():
    """Inicia el servidor (requiere docker-compose)"""
    try:
        container_status = docker_client.start_container()
        response = {'message': 'Server start initiated'}
        if container_status:
            response['container'] = container_status
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/server/stop', methods=['POST'])
def stop_server():
    """Detiene el servidor gracefully"""
    try:
        force = request.json.get('force', False) if request.is_json else False
        result = rcon.stop_server(force=force)
        container_status = docker_client.stop_container(timeout=30)
        response = {
            'message': 'Server stop initiated',
            'result': result,
        }
        if container_status:
            response['container'] = container_status
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error stopping server: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/server/restart', methods=['POST'])
def restart_server():
    """Reinicia el servidor"""
    try:
        delay = request.json.get('delay', 10) if request.is_json else 10
        result = rcon.restart_server(delay=delay)
        return jsonify({'message': 'Server restart initiated', 'result': result}), 200
    except Exception as e:
        logger.error(f"Error restarting server: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/server/command', methods=['POST'])
def execute_command():
    """Ejecuta un comando RCON personalizado"""
    try:
        data = request.get_json()
        command = data.get('command')
        
        if not command:
            return jsonify({'error': 'command is required'}), 400
        
        result = rcon.execute_command(command)
        return jsonify({'command': command, 'result': result}), 200
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== PLAYERS ====================

@app.route('/api/players', methods=['GET'])
def get_players():
    """Lista todos los jugadores con estadísticas"""
    try:
        players = db.get_all_players()
        return jsonify(players), 200
    except Exception as e:
        logger.error(f"Error getting players: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<uuid>', methods=['GET'])
def get_player(uuid):
    """Obtiene detalles de un jugador específico"""
    try:
        player = db.get_player(uuid)
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        return jsonify(player), 200
    except Exception as e:
        logger.error(f"Error getting player: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<uuid>/kick', methods=['POST'])
def kick_player(uuid):
    """Expulsa a un jugador del servidor"""
    try:
        player = db.get_player(uuid)
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        reason = request.json.get('reason', 'Kicked by admin') if request.is_json else 'Kicked by admin'
        result = rcon.kick_player(player['name'], reason)
        
        return jsonify({'message': f"Player {player['name']} kicked", 'result': result}), 200
    except Exception as e:
        logger.error(f"Error kicking player: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<uuid>/ban', methods=['POST'])
def ban_player(uuid):
    """Banea a un jugador"""
    try:
        player = db.get_player(uuid)
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        reason = request.json.get('reason', 'Banned by admin') if request.is_json else 'Banned by admin'
        result = rcon.ban_player(player['name'], reason)
        db.ban_player(uuid, reason)
        
        return jsonify({'message': f"Player {player['name']} banned", 'result': result}), 200
    except Exception as e:
        logger.error(f"Error banning player: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<uuid>/unban', methods=['POST'])
def unban_player(uuid):
    """Desbanea a un jugador"""
    try:
        player = db.get_player(uuid)
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        result = rcon.unban_player(player['name'])
        db.unban_player(uuid)
        
        return jsonify({'message': f"Player {player['name']} unbanned", 'result': result}), 200
    except Exception as e:
        logger.error(f"Error unbanning player: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== LOGS ====================

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Obtiene logs del servidor con filtrado opcional"""
    try:
        limit = request.args.get('limit', 100, type=int)
        log_type = request.args.get('type', None)

        logs = docker_client.get_logs(limit=limit)
        if log_type:
            logs = [log for log in logs if log.get('level') == log_type]

        if not logs:
            logs = db.get_logs(limit=limit, log_type=log_type)
        return jsonify(logs), 200
    except Exception as e:
        logger.error(f"Error getting logs: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/logs/download', methods=['GET'])
def download_logs():
    """Descarga logs del servidor en formato texto"""
    try:
        logs = docker_client.get_logs(limit=10000)
        if not logs:
            logs = db.get_logs(limit=10000)
        log_text = '\n'.join([f"{log['timestamp']} [{log['level']}] {log['message']}" for log in logs])
        
        return log_text, 200, {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment; filename="server-logs.txt"'
        }
    except Exception as e:
        logger.error(f"Error downloading logs: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== BACKUPS ====================

@app.route('/api/backups', methods=['GET'])
def get_backups():
    """Lista todos los backups disponibles"""
    try:
        backups = backup_handler.list_backups()
        return jsonify(backups), 200
    except Exception as e:
        logger.error(f"Error listing backups: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/backups/create', methods=['POST'])
def create_backup():
    """Crea un nuevo backup del servidor"""
    try:
        name = request.json.get('name', None) if request.is_json else None
        result = backup_handler.create_backup(name=name)

        if not result:
            return jsonify({'error': 'Backup creation failed'}), 500

        return jsonify({
            'message': 'Backup created successfully',
            'backup': result
        }), 201
    except Exception as e:
        logger.error(f"Error creating backup: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/backups/<backup_id>/restore', methods=['POST'])
def restore_backup(backup_id):
    """Restaura un backup específico"""
    try:
        force = request.json.get('force', False) if request.is_json else False
        result = backup_handler.restore_backup(backup_id, force=force)
        
        return jsonify({
            'message': 'Backup restore initiated',
            'result': result
        }), 200
    except Exception as e:
        logger.error(f"Error restoring backup: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/backups/<backup_id>/delete', methods=['DELETE'])
def delete_backup(backup_id):
    """Elimina un backup específico"""
    try:
        result = backup_handler.delete_backup(backup_id)
        return jsonify({'message': 'Backup deleted', 'result': result}), 200
    except Exception as e:
        logger.error(f"Error deleting backup: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== BANS ====================

@app.route('/api/bans', methods=['GET'])
def get_bans():
    """Lista de bans activos"""
    try:
        bans = db.get_bans()
        return jsonify(bans), 200
    except Exception as e:
        logger.error(f"Error getting bans: {e}")
        return jsonify({'error': str(e)}), 500



# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
