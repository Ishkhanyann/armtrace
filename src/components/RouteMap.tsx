import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin } from 'lucide-react';
import { type Batch, routeFor } from '../domain/model';

export default function RouteMap({ batch, compact = false }: { batch: Batch; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offline, setOffline] = useState(false);
  const [tiles, setTiles] = useState(true);
  const route = routeFor(batch.routeId);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    if (tiles) {
      const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      });
      layer.on('tileerror', () => setOffline(true));
      layer.on('tileload', () => setOffline(false));
      layer.addTo(map);
    }
    const points: L.LatLngTuple[] = route.stops.map((stop) => [stop.lat, stop.lng]);
    L.polyline(points, { color: '#93a5ba', weight: 3, dashArray: '7 8', opacity: 0.8 }).addTo(map);
    if (batch.stage > 0)
      L.polyline(points.slice(0, batch.stage + 1), { color: '#2672ef', weight: 4 }).addTo(map);
    route.stops.forEach((stop, index) => {
      const current = index === batch.stage;
      const icon = L.divIcon({
        className: 'route-marker-wrap',
        html: `<span class="route-marker ${index <= batch.stage ? 'complete' : ''} ${current ? 'current' : ''}">${index < batch.stage ? '✓' : index + 1}</span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const label = document.createElement('div');
      label.className = 'map-popup';
      const name = document.createElement('strong');
      name.textContent = stop.city;
      const subtitle = document.createElement('p');
      subtitle.textContent = `${stop.kind} · ${stop.country}`;
      label.append(name, subtitle);
      L.marker(points[index], { icon, title: `${stop.city} · ${stop.kind}` })
        .addTo(map)
        .bindPopup(label);
    });
    map.fitBounds(L.latLngBounds(points), { padding: compact ? [35, 40] : [60, 75], maxZoom: 8 });
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      map.remove();
    };
  }, [batch.routeId, batch.stage, compact, route, tiles]);
  return (
    <div className={`route-map ${compact ? 'compact' : ''}`}>
      <div
        ref={ref}
        className="leaflet-container-slot"
        aria-label={`Երթուղու քարտեզ․ ${route.name}`}
      />
      <span className="map-caption">
        <MapPin size={13} /> {offline || !tiles ? 'Սխեմատիկ երթուղի' : 'Երթուղու քարտեզ'}
      </span>
      <button
        className="map-layers"
        onClick={() => setTiles((value) => !value)}
        title="Փոխել քարտեզի շերտը"
        aria-label="Փոխել քարտեզի շերտը"
      >
        <Layers size={17} />
      </button>
      <span className="map-footnote">Ցուցադրական տեղադրություններ</span>
    </div>
  );
}
