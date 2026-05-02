import {
  regionSuggestions,
  stateCodeFromAddress,
  suggestionsForOrigin,
} from '../../constants/regionSuggestions';

describe('stateCodeFromAddress', () => {
  it('extracts the state from "City, ST, USA"', () => {
    expect(stateCodeFromAddress('Boston, MA, USA')).toBe('MA');
  });

  it('handles a full street address with ZIP', () => {
    expect(stateCodeFromAddress('123 Main St, Cambridge, MA 02139, USA')).toBe('MA');
  });

  it('returns null for non-US addresses', () => {
    expect(stateCodeFromAddress('Paris, France')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(stateCodeFromAddress('')).toBeNull();
    expect(stateCodeFromAddress(null)).toBeNull();
  });
});

describe('suggestionsForOrigin', () => {
  it('returns the New England suggestions for a Massachusetts origin', () => {
    const out = suggestionsForOrigin({ address: 'Boston, MA, USA' });
    expect(out).toBe(regionSuggestions.MA);
    expect(out.map((s) => s.name)).toContain('Acadia National Park');
  });

  it('shares the New England list across MA / NH / VT / ME / CT / RI', () => {
    expect(suggestionsForOrigin({ address: 'Concord, NH, USA' })).toBe(regionSuggestions.MA);
    expect(suggestionsForOrigin({ address: 'Burlington, VT, USA' })).toBe(regionSuggestions.MA);
  });

  it('returns the California list for a CA origin', () => {
    const out = suggestionsForOrigin({ address: 'San Francisco, CA, USA' });
    expect(out.map((s) => s.name)).toContain('Big Sur');
  });

  it('returns an empty list for unmapped states', () => {
    expect(suggestionsForOrigin({ address: 'Austin, TX, USA' })).toEqual([]);
  });

  it('returns an empty list when origin is null or address is missing', () => {
    expect(suggestionsForOrigin(null)).toEqual([]);
    expect(suggestionsForOrigin({})).toEqual([]);
  });
});
