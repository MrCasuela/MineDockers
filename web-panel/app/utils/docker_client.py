"""
Docker client helper for container stats and logs.
"""

from __future__ import annotations

import logging
import os
import re
from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    import docker
except Exception:  # pragma: no cover - optional dependency at runtime
    docker = None

logger = logging.getLogger(__name__)

LEVEL_RE = re.compile(r"\b(INFO|WARN|ERROR|FATAL|DEBUG|TRACE)\b")


def _bytes_to_mb(value: int) -> float:
    return round(value / (1024 * 1024), 2)


class DockerClient:
    """Fetches stats and logs from the Minecraft container."""

    def __init__(self, container_name: Optional[str] = None):
        self.container_name = container_name or os.getenv(
            "MC_CONTAINER_NAME", "minecraft-server"
        )
        self.client = None

        if docker is None:
            logger.warning("Docker SDK not available")
            return

        try:
            self.client = docker.from_env()
        except Exception as exc:
            logger.error(f"Docker client init failed: {exc}")
            self.client = None

    def _get_container(self):
        if not self.client:
            return None
        try:
            return self.client.containers.get(self.container_name)
        except Exception as exc:
            logger.error(f"Docker container not found: {exc}")
            return None

    def get_memory_usage(self) -> Optional[Dict[str, Any]]:
        container = self._get_container()
        if not container:
            return None

        try:
            stats = container.stats(stream=False)
            memory_stats = stats.get("memory_stats", {})
            usage = int(memory_stats.get("usage", 0))
            limit = int(memory_stats.get("limit", 0))
            cache = int(memory_stats.get("stats", {}).get("cache", 0))

            usage = max(0, usage - cache)

            return {
                "memory": int(round(_bytes_to_mb(usage))),
                "maxMemory": int(round(_bytes_to_mb(limit))),
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as exc:
            logger.error(f"Docker stats error: {exc}")
            return None

    def get_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        container = self._get_container()
        if not container:
            return []

        try:
            raw = container.logs(timestamps=True, tail=limit)
            text = raw.decode("utf-8", errors="ignore")
            lines = [line for line in text.splitlines() if line.strip()]
            return [self._parse_log_line(line) for line in lines]
        except Exception as exc:
            logger.error(f"Docker logs error: {exc}")
            return []

    def is_container_running(self) -> bool:
        """Returns True if the minecraft container is currently running."""
        container = self._get_container()
        if not container:
            return False
        try:
            container.reload()
            return container.status == "running"
        except Exception as exc:
            logger.error(f"Docker status check error: {exc}")
            return False

    def stop_container(self, timeout: int = 30) -> Optional[str]:
        container = self._get_container()
        if not container:
            return None

        try:
            container.stop(timeout=timeout)
            return "stopped"
        except Exception as exc:
            logger.error(f"Docker stop error: {exc}")
            return None

    def start_container(self) -> Optional[str]:
        container = self._get_container()
        if not container:
            return None

        try:
            container.reload()
            if container.status != "running":
                container.start()
                container.reload()
            return container.status
        except Exception as exc:
            logger.error(f"Docker start error: {exc}")
            return None

    def _parse_log_line(self, line: str) -> Dict[str, Any]:
        timestamp = datetime.utcnow().isoformat()
        message = line

        if " " in line:
            possible_ts, rest = line.split(" ", 1)
            if possible_ts.endswith("Z") and "T" in possible_ts:
                timestamp = possible_ts
                message = rest

        level_match = LEVEL_RE.search(message)
        level = level_match.group(1) if level_match else "INFO"

        return {
            "timestamp": timestamp,
            "level": level,
            "message": message.strip(),
            "log_type": level,
        }
