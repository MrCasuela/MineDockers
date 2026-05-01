FROM debian:bookworm-slim

# Build arguments
ARG MC_VERSION=MC_VERSION
ARG FORGE_VERSION=FORGE_VERSION
ARG PLAYIT_VERSION=PLAYIT_VERSION
ARG JAVA_XMS=JAVA_XMS
ARG JAVA_XMX=JAVA_XMX
ARG SERVER_TYPE=forge

# Variables de entorno
ENV MINECRAFT_HOME=/minecraft/server
ENV JAVA_XMS=$JAVA_XMS
ENV JAVA_XMX=$JAVA_XMS
ENV PLAYIT_VERSION=$PLAYIT_VERSION
ENV FORGE_VERSION=$FORGE_VERSION
ENV MC_VERSION=$MC_VERSION
ENV SERVER_TYPE=$SERVER_TYPE

# Instalar Java y dependencias necesarias
RUN apt-get update && apt-get install -y \
    default-jdk \
    wget \
    curl \
    jq \
    git \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Crear directorios
RUN mkdir -p $MINECRAFT_HOME /etc/playit

# Descargar playit.gg
RUN ARCH=$(dpkg --print-architecture) && \
    case "$ARCH" in \
      amd64) PLAYIT_BIN="playit-linux-amd64" ;; \
      arm64) PLAYIT_BIN="playit-linux-aarch64" ;; \
      armhf) PLAYIT_BIN="playit-linux-armv7" ;; \
      i386) PLAYIT_BIN="playit-linux-i686" ;; \
      *) echo "Arquitectura no soportada: $ARCH" && exit 1 ;; \
    esac && \
    wget -O /usr/local/bin/playit "https://builds.playit.gg/${PLAYIT_VERSION}/${PLAYIT_BIN}" && \
    chmod +x /usr/local/bin/playit && \
    echo "✓ playit.gg descargado e instalado"

WORKDIR $MINECRAFT_HOME

# Copiar mods y configuraciones
COPY mods/ /minecraft/server/mods/
COPY config/ /minecraft/server/config/

# Descargar servidor según SERVER_TYPE (forge | vanilla)
RUN if [ "$SERVER_TYPE" = "vanilla" ]; then \
        echo "Descargando servidor Vanilla ${MC_VERSION}..." && \
        VERSION_URL=$(curl -s "https://launchermeta.mojang.com/mc/game/version_manifest.json" | \
            jq -r --arg v "${MC_VERSION}" '.versions[] | select(.id == $v) | .url') && \
        if [ -z "$VERSION_URL" ] || [ "$VERSION_URL" = "null" ]; then \
            echo "❌ Versión ${MC_VERSION} no encontrada en el manifest de Mojang" && exit 1; \
        fi && \
        SERVER_URL=$(curl -s "$VERSION_URL" | jq -r '.downloads.server.url') && \
        wget -O minecraft_server.jar "$SERVER_URL" && \
        echo "✓ Servidor vanilla ${MC_VERSION} descargado"; \
    elif [ "$SERVER_TYPE" = "forge" ]; then \
        echo "Descargando Forge ${FORGE_VERSION} para Minecraft ${MC_VERSION}..." && \
        wget -O forge-installer.jar "https://maven.minecraftforge.net/net/minecraftforge/forge/${MC_VERSION}-${FORGE_VERSION}/forge-${MC_VERSION}-${FORGE_VERSION}-installer.jar" && \
        echo "✓ Forge descargado, instalando..." && \
        java -jar forge-installer.jar --installServer && \
        echo "✓ Forge instalado" && \
        rm -f forge-installer.jar; \
    else \
        echo "❌ SERVER_TYPE desconocido: ${SERVER_TYPE}. Use 'forge' o 'vanilla'" && exit 1; \
    fi

# Script de inicio simplificado
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Crear usuario no-root
RUN useradd -m -u 1000 minecraft && chown -R minecraft:minecraft $MINECRAFT_HOME

USER minecraft

# Puerto del servidor
EXPOSE 25565 25575

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ps aux | grep -v grep | grep java || exit 1

ENTRYPOINT ["/entrypoint.sh"]
