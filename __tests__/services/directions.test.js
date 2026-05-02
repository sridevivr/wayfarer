import { decodePolyline, DirectionsError, getDirections } from '../../services/directions';

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

const origin = { lat: 42.36, lng: -71.06 };
const destination = { lat: 44.34, lng: -68.27 };

function route(distanceMeters, durationSeconds, summary, points) {
  return {
    summary,
    overview_polyline: { points },
    legs: [{ distance: { value: distanceMeters }, duration: { value: durationSeconds } }],
  };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

describe('decodePolyline', () => {
  // Google's documented sample. See:
  // https://developers.google.com/maps/documentation/utilities/polylinealgorithm
  it('decodes the canonical Google sample to the expected lat/lng triples', () => {
    const out = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    expect(out).toHaveLength(3);
    expect(out[0].lat).toBeCloseTo(38.5, 5);
    expect(out[0].lng).toBeCloseTo(-120.2, 5);
    expect(out[1].lat).toBeCloseTo(40.7, 5);
    expect(out[1].lng).toBeCloseTo(-120.95, 5);
    expect(out[2].lat).toBeCloseTo(43.252, 5);
    expect(out[2].lng).toBeCloseTo(-126.453, 5);
  });

  it('returns an empty array for empty input', () => {
    expect(decodePolyline('')).toEqual([]);
    expect(decodePolyline(null)).toEqual([]);
    expect(decodePolyline(undefined)).toEqual([]);
  });
});

describe('getDirections', () => {
  it('throws when origin or destination is missing', async () => {
    await expect(getDirections({})).rejects.toThrow(/Missing/);
    await expect(getDirections({ origin })).rejects.toThrow(/Missing/);
  });

  it('sorts 3 routes by distance ascending and labels Fastest / Medium / Longest', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({
        status: 'OK',
        routes: [
          route(130000, 8000, 'US-1', '_p~iF~ps|U_ulLnnqC_mqNvxq`@'),
          route(100000, 6000, 'I-95', '_p~iF~ps|U_ulLnnqC_mqNvxq`@'),
          route(110000, 7000, 'Scenic', '_p~iF~ps|U_ulLnnqC_mqNvxq`@'),
        ],
      })
    );
    const out = await getDirections({ origin, destination });
    expect(out).toHaveLength(3);
    expect(out.map((r) => r.summary)).toEqual(['I-95', 'Scenic', 'US-1']);
    expect(out.map((r) => r.label)).toEqual(['Fastest', 'Medium', 'Longest']);
    expect(out.map((r) => r.distanceMeters)).toEqual([100000, 110000, 130000]);
    expect(out[0].polyline).toHaveLength(3); // decodes to 3 points
  });

  it('caps results at 3 even when the API returns more', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({
        status: 'OK',
        routes: [
          route(100, 1, 'A', ''),
          route(200, 2, 'B', ''),
          route(300, 3, 'C', ''),
          route(400, 4, 'D', ''),
        ],
      })
    );
    const out = await getDirections({ origin, destination });
    expect(out).toHaveLength(3);
    expect(out.map((r) => r.summary)).toEqual(['A', 'B', 'C']);
  });

  it('labels a single route as Fastest', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({ status: 'OK', routes: [route(100, 1, 'Solo', '')] })
    );
    const out = await getDirections({ origin, destination });
    expect(out).toHaveLength(1);
    expect(out[0].label).toBe('Fastest');
  });

  it('labels two routes as Fastest + Longest', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({
        status: 'OK',
        routes: [route(200, 2, 'B', ''), route(100, 1, 'A', '')],
      })
    );
    const out = await getDirections({ origin, destination });
    expect(out.map((r) => r.label)).toEqual(['Fastest', 'Longest']);
    expect(out.map((r) => r.summary)).toEqual(['A', 'B']);
  });

  it('returns an empty array on ZERO_RESULTS', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ status: 'ZERO_RESULTS', routes: [] }));
    expect(await getDirections({ origin, destination })).toEqual([]);
  });

  it('returns an empty array when routes is missing or empty', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ status: 'OK', routes: [] }));
    expect(await getDirections({ origin, destination })).toEqual([]);
  });

  it('throws DirectionsError on a non-OK API status', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({ status: 'REQUEST_DENIED', error_message: 'bad key' })
    );
    await expect(getDirections({ origin, destination })).rejects.toMatchObject({
      status: 'REQUEST_DENIED',
    });
  });

  it('throws DirectionsError on a non-2xx HTTP status', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ error: 'oops' }, 500));
    await expect(getDirections({ origin, destination })).rejects.toMatchObject({
      status: 500,
    });
  });

  it('sends walking mode + alternatives=true and origin/destination as lat,lng', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse({ status: 'OK', routes: [route(100, 1, 'A', '')] })
    );
    await getDirections({ origin, destination });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('mode=walking');
    expect(url).toContain('alternatives=true');
    expect(url).toContain(`origin=${encodeURIComponent('42.36,-71.06')}`);
    expect(url).toContain(`destination=${encodeURIComponent('44.34,-68.27')}`);
  });
});

describe('DirectionsError', () => {
  it('preserves the status and body for callers', () => {
    const err = new DirectionsError(500, { error: 'oops' });
    expect(err.status).toBe(500);
    expect(err.body).toEqual({ error: 'oops' });
  });
});
