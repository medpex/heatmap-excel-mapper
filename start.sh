#!/bin/bash
# Analytics Tool - Docker Startup Script
# Erstellt komplett neue Docker Images und startet alle Services

set -e  # Beenden bei Fehlern

echo "🐳 Stopping und Bereinigung aller Docker Container und Images..."

# Alle laufenden Container stoppen
echo "Stoppe alle laufenden Container..."
docker stop $(docker ps -aq) 2>/dev/null || echo "Keine laufenden Container gefunden"

# Alle Container löschen
echo "Lösche alle Container..."
docker rm $(docker ps -aq) 2>/dev/null || echo "Keine Container zum Löschen gefunden"

# Alle Images löschen (um frisch zu bauen)
echo "Lösche alle lokalen Images..."
docker rmi $(docker images -aq) 2>/dev/null || echo "Keine Images zum Löschen gefunden"

# Docker System aufräumen
echo "Docker System Cleanup..."
docker system prune -af --volumes

echo "✅ Docker Cleanup abgeschlossen!"

echo "🔨 Baue neue Docker Images und starte Services..."

# Neue Images bauen und Container starten
docker-compose up --build -d

echo "🚀 Services gestartet!"
echo ""
echo "📊 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:4000"
echo ""
echo "📋 Container Status:"
docker-compose ps

echo ""
echo "📝 Logs anzeigen mit: docker-compose logs -f"
echo "🛑 Services stoppen mit: docker-compose down"