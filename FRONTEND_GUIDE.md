# Guía de Uso - Frontend Minecraft Panel v2.0

## 🎮 Cómo Acceder

### Local
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:8080/api
- **Servidor Minecraft**: localhost:25565

### Con Docker
```bash
docker-compose up -d
# Frontend está en http://localhost:3000
```

## 📊 Dashboard
La página principal muestra:
- **Estado del servidor** (en línea/offline)
- **Estadísticas en tiempo real**: jugadores conectados, totales, backups, TPS
- **Gráfico de jugadores**
- **Lista de jugadores recientes**
- **Monitor de memoria** del servidor

### Acciones Rápidas
- 🔄 **Actualizar**: Recarga las estadísticas
- 🔁 **Reiniciar**: Reinicia el servidor (con aviso)
- ⏹️ **Detener**: Detiene el servidor gracefully

## 👥 Gestión de Jugadores

### Listado
Ver todos los jugadores con:
- Nombre y UUID
- Estado (en línea/offline)
- Tiempo de juego
- Último acceso

### Acciones
- 🚪 **Expulsar**: Kick a un jugador con razón personalizada
- 🚫 **Banear**: Banea permanentemente a un jugador
- El jugador baneado no podrá conectarse

## 💾 Backups

### Crear
1. Click en "Crear Backup"
2. (Opcional) Ingresa un nombre personalizado
3. Confirma

### Restaurar
1. Selecciona un backup
2. Click en "Restaurar"
3. Se guardará un respaldo de seguridad antes de restaurar

### Eliminar
1. Selecciona un backup
2. Click en "Eliminar"
⚠️ Esta acción **no se puede deshacer**

## 📝 Logs

### Visualizar
- Filtrar por tipo: INFO, WARN, ERROR
- Cambiar límite de líneas mostradas (50-1000)
- Scroll para ver más logs

### Descargar
- Click en "Descargar" para obtener un archivo .txt
- Útil para análisis y depuración

## ⚙️ Configuración

### Información del Servidor
Datos del servidor: versión, puertos, panel API

### Ejecutor de Comandos RCON
Ejecuta comandos directamente en el servidor:
```
say Hola Mundo
weather clear
time set day
gamerule doDaylightCycle false
list
```

### Comandos Comunes Disponibles
Clicky rápido para comandos frecuentes

⚠️ **Advertencia**: El acceso a comandos es muy poderoso. Úsalo con cuidado.

## 🔐 Seguridad

### Mejores Prácticas
1. Cambia las contraseñas en `.env` antes de usar en producción
2. El ejecutor de comandos solo para administradores
3. Los backups se hacen automáticamente
4. Los logs se guardan permanentemente en MySQL

### Acceso Remoto
- Usa playit.gg o ngrok para exponer el panel a internet
- Protege con VPN o contraseña HTTP
- No expongas puertos directamente si no es necesario

## 🚀 Inicio Rápido

```bash
# 1. Clonar/descargar el proyecto
cd Minecraft-Dockers

# 2. Configurar variables
cp .env.example .env
# Edita .env con tus valores

# 3. Iniciar servicios
docker-compose up -d

# 4. Acceder
# Frontend: http://localhost:3000
# Servidor Minecraft: localhost:25565
# Backups: /backups (en el contenedor)

# 5. Ver logs
docker-compose logs -f frontend
docker-compose logs -f web-panel
docker-compose logs -f minecraft
```

## 🔧 Troubleshooting

### Frontend no carga
- Verifica que `docker-compose up -d` se ejecutó correctamente
- Revisa: `docker ps` (debe haber 4 contenedores)
- Consulta logs: `docker-compose logs frontend`

### API no responde
- Verifica conexión a MySQL: `docker-compose logs mysql-db`
- Revisa logs del panel: `docker-compose logs web-panel`
- Verifica que el servidor Minecraft esté corriendo

### Comandos RCON no funcionan
- Verifica RCON_PASSWORD en .env
- Asegúrate que el servidor Minecraft está en línea
- Revisa que el puerto 25575 esté expuesto

### Backups no se crean
- Verifica permisos del volumen `/backups`
- Revisa logs: `docker-compose logs web-panel`
- Espacio en disco disponible

## 📚 Recursos Útiles

- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Minecraft Commands**: https://minecraft.fandom.com/wiki/Commands
- **RCON Protocol**: https://wiki.vg/RCON

## 📞 Soporte

Para problemas o sugerencias, revisa:
- Los logs del contenedor
- La consola del navegador (F12)
- Las variables de entorno en `.env`

---

**Versión**: 2.0.0
**Última actualización**: 2026-04-27
