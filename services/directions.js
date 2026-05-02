// Wraps the Google Directions API. Returns up to 3 alternatives sorted
// by distance ascending, labeled "Fastest" / "Medium" / "Longest". With
// fewer than 3 the labels degrade naturally:
//   1 route  → ["Fastest"]
//   2 routes → ["Fastest", "Longest"]
//
// Uses walking mode to match the conceptual model (Wayfarer is a
// walking-motivation app). Walking + alternatives=true sometimes
// returns a single route — that's accepted.
//
// `decodePolyline` implements the standard Google encoded-polyline
// algorithm. Hand-rolled to avoid an extra dependency.

const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

class DirectionsError extends Error {
  constructor(status, body) {
    super(`Directions ${status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

export function decodePolyline(encoded) {
  if (!encoded) return [];
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const len = encoded.length;
  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

function labelFor(index, total) {
  if (total <= 1) return 'Fastest';
  if (total === 2) return index === 0 ? 'Fastest' : 'Longest';
  return ['Fastest', 'Medium', 'Longest'][index];
}

function normalizeRoute(r) {
  const leg = r.legs?.[0] ?? {};
  return {
    summary: r.summary ?? '',
    distanceMeters: leg.distance?.value ?? 0,
    durationSeconds: leg.duration?.value ?? 0,
    polyline: decodePolyline(r.overview_polyline?.points ?? ''),
  };
}

export async function getDirections({ origin, destination }) {
  if (!origin || !destination) throw new Error('Missing origin or destination');
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: 'walking',
    alternatives: 'true',
    key: API_KEY,
  });
  const url = `${DIRECTIONS_URL}?${params.toString()}`;
  if (__DEV__) console.log('[directions] GET', url.replace(API_KEY, '***'));
  const res = await fetch(url);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new DirectionsError(res.status, json);
  if (json?.status === 'ZERO_RESULTS') return [];
  if (json?.status !== 'OK') {
    throw new DirectionsError(json?.status ?? 'UNKNOWN', json?.error_message ?? json);
  }
  if (!json.routes?.length) return [];
  const normalized = json.routes
    .map(normalizeRoute)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 3);
  return normalized.map((r, i, arr) => ({ ...r, label: labelFor(i, arr.length) }));
}

export { DirectionsError };
