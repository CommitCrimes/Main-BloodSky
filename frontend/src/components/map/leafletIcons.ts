import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import droneTopViewImage from '@/assets/drone_TopView.png';
import BloodHouseIcon from '@/assets/point-depart.svg';
import HopitalIcon from '@/assets/point-arrive.svg';

// À exécuter UNE seule fois pour corriger les URLs par défaut
let patched = false;
export function patchLeafletDefaultIcons() {
  if (patched || typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
  patched = true;
}

// Icônes statiques réutilisables
export const bloodHouseIcon = L.icon({
  iconUrl: BloodHouseIcon,
  iconSize: [60, 140],
  iconAnchor: [30, 70],
  popupAnchor: [0, -40],
});

export const hospitalIcon = L.icon({
  iconUrl: HopitalIcon,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  popupAnchor: [0, -40],
});

// Icône dynamique (orientation du drone)
export function createDroneIcon(heading: number) {
  return L.divIcon({
    html: `
      <div style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;">
        <img src="${droneTopViewImage}" style="width:65px;height:65px;transform:rotate(${heading}deg);filter:drop-shadow(2px 2px 4px rgba(0,0,0,0.5));" />
      </div>
    `,
    className: 'drone-marker',
    iconSize: [80, 80],
    iconAnchor: [40, 40],
  });
}
