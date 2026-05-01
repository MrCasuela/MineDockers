-- ============================================
-- Inicialización de Base de Datos Minecraft
-- ============================================

-- Crear tabla de jugadores
CREATE TABLE IF NOT EXISTS players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    username VARCHAR(16) NOT NULL,
    first_join TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_join TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    total_playtime INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'offline',
    is_op BOOLEAN DEFAULT 0
);

-- Crear tabla de estadísticas
CREATE TABLE IF NOT EXISTS player_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    kills INT DEFAULT 0,
    deaths INT DEFAULT 0,
    blocks_placed INT DEFAULT 0,
    blocks_broken INT DEFAULT 0,
    distance_traveled INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_stats (player_id)
);

-- Crear tabla de bans
CREATE TABLE IF NOT EXISTS bans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL,
    username VARCHAR(16) NOT NULL,
    reason VARCHAR(255),
    banned_by VARCHAR(16),
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_permanent BOOLEAN DEFAULT 0
);

-- Crear tabla de whitelist (si es necesario)
CREATE TABLE IF NOT EXISTS whitelist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    username VARCHAR(16) NOT NULL,
    added_by VARCHAR(16),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de logs del servidor
CREATE TABLE IF NOT EXISTS server_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    player_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_players_uuid ON players(uuid);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_server_logs_player ON server_logs(player_id);
CREATE INDEX idx_server_logs_type ON server_logs(log_type);
CREATE INDEX idx_bans_uuid ON bans(uuid);
