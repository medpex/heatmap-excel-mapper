import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { DataRow } from './DataVisualizationTool';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  data: DataRow[];
  layer: 'heatmap' | 'cluster' | 'marker';
}

const MapComponent = ({ data, layer }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const clusterGroup = useRef<any>(null);
  const heatmapLayer = useRef<any>(null);
  const markerLayer = useRef<any>(null);
  const userInteracted = useRef<boolean>(false);
  const initialLoad = useRef<boolean>(true);

  // Memoize valid data for performance
  const validData = useMemo(() => 
    data.filter(row => row.latitude && row.longitude), 
    [data]
  );

  // Memoize heatmap data - use count of connections instead of KW-Zahl
  const heatData = useMemo(() => 
    validData.map(row => [
      row.latitude!,
      row.longitude!,
      1 // Each connection has equal weight
    ]), 
    [validData]
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if not exists
    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        center: [51.1657, 10.4515],
        zoom: 6,
        scrollWheelZoom: true,
        zoomControl: true,
        preferCanvas: true, // Better performance for large datasets
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map.current);

      // Track user interaction to prevent auto-zoom
      map.current.on('zoomstart', () => {
        userInteracted.current = true;
      });
      map.current.on('dragstart', () => {
        userInteracted.current = true;
      });
      map.current.on('movestart', () => {
        userInteracted.current = true;
      });
    }

    // Remove all layers
    if (clusterGroup.current) {
      map.current?.removeLayer(clusterGroup.current);
    }
    if (heatmapLayer.current) {
      map.current?.removeLayer(heatmapLayer.current);
    }
    if (markerLayer.current) {
      map.current?.removeLayer(markerLayer.current);
    }

    if (validData.length === 0) return;

    // Cluster Layer
    if (layer === 'cluster') {
      clusterGroup.current = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });
      const markers = validData.map((row) => {
        const marker = L.marker([row.latitude!, row.longitude!]);
        const popupContent = `
          <div class="p-3 min-w-[250px]">
            <h3 class="font-semibold text-lg mb-2 text-blue-600">${row.Sparte}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Adresse:</strong> ${row['Ort, Strasse Haus-Nr']}</p>
              <p><strong>PLZ:</strong> ${row.PLZ}</p>
              <p><strong>Art:</strong> ${row.Art}</p>
              ${row['KW-Zahl'] ? `<p><strong>KW-Zahl:</strong> ${row['KW-Zahl']}</p>` : ''}
              ${row.Notiz ? `<p><strong>Notiz:</strong> ${row.Notiz}</p>` : ''}
              ${row.Datum ? `<p><strong>Datum:</strong> ${row.Datum}</p>` : ''}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        return marker;
      });
      clusterGroup.current.addLayers(markers);
      map.current?.addLayer(clusterGroup.current);
      if (validData.length > 0 && (!userInteracted.current || initialLoad.current)) {
        map.current?.fitBounds(clusterGroup.current.getBounds().pad(0.1));
        initialLoad.current = false;
      }
    }

    // Heatmap Layer
    if (layer === 'heatmap' && (L as any).heatLayer && heatData.length > 0) {
      heatmapLayer.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.0: '#0066ff',
          0.2: '#00ccff', 
          0.4: '#00ff99',
          0.6: '#66ff00',
          0.8: '#ffcc00',
          1.0: '#ff3300'
        }
      });
      map.current?.addLayer(heatmapLayer.current);
      if (validData.length > 0 && (!userInteracted.current || initialLoad.current)) {
        map.current?.fitBounds(L.latLngBounds(validData.map(d => [d.latitude!, d.longitude!])).pad(0.1));
        initialLoad.current = false;
      }
    }

    // Marker Layer (keine Cluster, nur einzelne Marker)
    if (layer === 'marker') {
      markerLayer.current = L.layerGroup();
      validData.forEach((row) => {
        const marker = L.marker([row.latitude!, row.longitude!]);
        const popupContent = `
          <div class="p-3 min-w-[250px]">
            <h3 class="font-semibold text-lg mb-2 text-blue-600">${row.Sparte}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Adresse:</strong> ${row['Ort, Strasse Haus-Nr']}</p>
              <p><strong>PLZ:</strong> ${row.PLZ}</p>
              <p><strong>Art:</strong> ${row.Art}</p>
              ${row['KW-Zahl'] ? `<p><strong>KW-Zahl:</strong> ${row['KW-Zahl']}</p>` : ''}
              ${row.Notiz ? `<p><strong>Notiz:</strong> ${row.Notiz}</p>` : ''}
              ${row.Datum ? `<p><strong>Datum:</strong> ${row.Datum}</p>` : ''}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        markerLayer.current.addLayer(marker);
      });
      map.current?.addLayer(markerLayer.current);
      if (validData.length > 0 && (!userInteracted.current || initialLoad.current)) {
        map.current?.fitBounds(L.latLngBounds(validData.map(d => [d.latitude!, d.longitude!])).pad(0.1));
        initialLoad.current = false;
      }
    }

  }, [validData, heatData, layer]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative bg-muted/30">
      <div 
        ref={mapContainer} 
        className="h-[700px] w-full"
        style={{ minHeight: '700px' }}
      />
      <div className="absolute top-6 right-6 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-strong border border-border">
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Legende</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
              <span className="text-muted-foreground font-medium">Anschlüsse</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-destructive rounded-full shadow-sm"></div>
              <span className="text-muted-foreground font-medium">Dichte</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground/80">
              Intensität: Anzahl Anschlüsse
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;