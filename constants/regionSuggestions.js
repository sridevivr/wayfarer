// Hardcoded "Suggested destinations" list keyed by US state code. The
// Destination screen extracts the state code from the origin's address
// and surfaces the matching list above free-search results. Origins
// outside these regions hide the suggestions entirely.
//
// Each suggestion is a complete PlaceObject so selection writes directly
// to the goal-draft without a Place Details lookup.

const NEW_ENGLAND = [
  {
    name: 'Acadia National Park',
    address: 'Bar Harbor, ME, USA',
    lat: 44.3386,
    lng: -68.2733,
    placeId: 'acadia-suggestion',
  },
  {
    name: 'Newport',
    address: 'Newport, RI, USA',
    lat: 41.4901,
    lng: -71.3128,
    placeId: 'newport-suggestion',
  },
  {
    name: 'Cape Cod',
    address: 'Barnstable County, MA, USA',
    lat: 41.6688,
    lng: -70.2962,
    placeId: 'capecod-suggestion',
  },
];

const CALIFORNIA = [
  {
    name: 'Big Sur',
    address: 'Big Sur, CA, USA',
    lat: 36.2704,
    lng: -121.8081,
    placeId: 'bigsur-suggestion',
  },
  {
    name: 'Yosemite National Park',
    address: 'Yosemite Valley, CA, USA',
    lat: 37.8651,
    lng: -119.5383,
    placeId: 'yosemite-suggestion',
  },
  {
    name: 'Lake Tahoe',
    address: 'South Lake Tahoe, CA, USA',
    lat: 38.9399,
    lng: -119.9772,
    placeId: 'tahoe-suggestion',
  },
];

export const regionSuggestions = {
  MA: NEW_ENGLAND,
  NH: NEW_ENGLAND,
  VT: NEW_ENGLAND,
  ME: NEW_ENGLAND,
  CT: NEW_ENGLAND,
  RI: NEW_ENGLAND,
  CA: CALIFORNIA,
};

// Pull the two-letter state code out of a Google formatted_address.
// Examples:
//   "Boston, MA, USA"                       → "MA"
//   "123 Main St, Cambridge, MA 02139, USA" → "MA"
//   "Paris, France"                         → null
export function stateCodeFromAddress(address) {
  if (!address) return null;
  const m = address.match(/,\s*([A-Z]{2})(?:\s+\d{5})?,?\s*USA\b/);
  return m ? m[1] : null;
}

export function suggestionsForOrigin(origin) {
  if (!origin) return [];
  const state = stateCodeFromAddress(origin.address);
  if (!state) return [];
  return regionSuggestions[state] ?? [];
}
