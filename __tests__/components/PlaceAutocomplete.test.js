import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import PlaceAutocomplete from '../../components/PlaceAutocomplete';

function jsonResponse(body) {
  return { ok: true, json: () => Promise.resolve(body) };
}

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
  delete global.fetch;
});

const autocompleteResponse = jsonResponse({
  status: 'OK',
  predictions: [
    {
      place_id: 'p1',
      description: 'Boston, MA, USA',
      structured_formatting: { main_text: 'Boston', secondary_text: 'MA, USA' },
    },
    {
      place_id: 'p2',
      description: 'Boston Heights, OH, USA',
      structured_formatting: { main_text: 'Boston Heights', secondary_text: 'OH, USA' },
    },
  ],
});

const detailsResponse = jsonResponse({
  status: 'OK',
  result: {
    name: 'Boston',
    formatted_address: 'Boston, MA, USA',
    geometry: { location: { lat: 42.3601, lng: -71.0589 } },
    place_id: 'p1',
  },
});

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('PlaceAutocomplete', () => {
  it('debounces typing and renders predictions after the delay', async () => {
    fetch.mockResolvedValueOnce(autocompleteResponse);
    const { getByTestId, queryByText } = render(
      <PlaceAutocomplete onSelect={() => {}} placeholder="Search…" />
    );
    fireEvent.changeText(getByTestId('place-autocomplete-input'), 'Bost');

    // Before the debounce fires, no fetch yet.
    expect(fetch).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(250);
    });
    await flushPromises();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toContain('autocomplete/json');
    expect(fetch.mock.calls[0][0]).toContain('input=Bost');
    await waitFor(() => expect(queryByText('Boston')).toBeTruthy());
    expect(queryByText('Boston Heights')).toBeTruthy();
  });

  it('selecting a prediction fetches Place Details and emits a PlaceObject', async () => {
    fetch
      .mockResolvedValueOnce(autocompleteResponse)
      .mockResolvedValueOnce(detailsResponse);
    const onSelect = jest.fn();
    const { getByTestId, getByText } = render(
      <PlaceAutocomplete onSelect={onSelect} placeholder="Search…" />
    );
    fireEvent.changeText(getByTestId('place-autocomplete-input'), 'Bost');
    await act(async () => {
      jest.advanceTimersByTime(250);
    });
    await flushPromises();
    await waitFor(() => getByText('Boston'));

    fireEvent.press(getByTestId('place-autocomplete-result-p1'));
    await flushPromises();
    await flushPromises();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toContain('details/json');
    expect(fetch.mock.calls[1][0]).toContain('place_id=p1');
    expect(onSelect).toHaveBeenCalledWith({
      name: 'Boston',
      address: 'Boston, MA, USA',
      lat: 42.3601,
      lng: -71.0589,
      placeId: 'p1',
    });
  });

  it('shows an error when the autocomplete request fails', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ status: 'REQUEST_DENIED', error_message: 'bad key' }));
    const { getByTestId, findByText } = render(
      <PlaceAutocomplete onSelect={() => {}} placeholder="Search…" />
    );
    fireEvent.changeText(getByTestId('place-autocomplete-input'), 'Bost');
    await act(async () => {
      jest.advanceTimersByTime(250);
    });
    await flushPromises();
    expect(await findByText(/Couldn't reach Places API/)).toBeTruthy();
  });

  it('does not fetch for queries shorter than 2 characters', async () => {
    const { getByTestId } = render(
      <PlaceAutocomplete onSelect={() => {}} placeholder="Search…" />
    );
    fireEvent.changeText(getByTestId('place-autocomplete-input'), 'B');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('pre-fills the input from initialQuery', () => {
    const { getByDisplayValue } = render(
      <PlaceAutocomplete onSelect={() => {}} initialQuery="Cambridge, MA" />
    );
    expect(getByDisplayValue('Cambridge, MA')).toBeTruthy();
  });
});
