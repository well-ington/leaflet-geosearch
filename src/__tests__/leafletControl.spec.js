import LeafletControl from '../leafletControl';
import randomId from '../../test/randomId';

function createMapInstance(options, id = randomId()) {
  const div = document.createElement('div');
  div.setAttribute('id', id);

  document.body.appendChild(div);
  const map = new L.map(div, options); // eslint-disable-line new-cap

  return { map, div, id };
}

test('Can init leaflet', () => {
  const { div, map } = createMapInstance();

  expect(div._leaflet_id).toBeDefined();
  expect(map._leaflet_id).toBeDefined();
  expect(div._leaflet_id).not.toEqual(map._leaflet_id);
  expect(map._initHooksCalled).toEqual(true);
});

test('Can add geosearch control to leaflet', () => {
  const { div, map } = createMapInstance();

  const provider = { search: jest.fn() };
  const control = new LeafletControl({
    provider,
  }).addTo(map);

  expect(div.contains(control.searchElement.elements.container)).toEqual(true);
});

test('It toggles the active class when the search button is clicked', () => {
  const { map } = createMapInstance();

  const provider = { search: jest.fn() };
  const control = new LeafletControl({
    provider,
  }).addTo(map);

  const { button } = control.elements;
  const { container } = control.searchElement.elements;

  button.click(new Event('click'));
  expect(container.className).toEqual(expect.stringMatching(/active/));

  button.click(new Event('click'));
  expect(container.className).not.toEqual(expect.stringMatching(/active/));
});

test('Shows result on submit', async () => {
  const { map } = createMapInstance();

  const query = 'some city';
  const result = [{ x: 0, y: 50 }];

  const provider = { search: jest.fn(async () => result) };

  const control = new LeafletControl({
    provider,
  }).addTo(map);

  control.showResult = jest.fn();
  await control.onSubmit('some city');

  expect(control.showResult).toHaveBeenCalledWith(result[0], query);
});

test('Change view on result', () => {
  const { map } = createMapInstance({
    center: [180, 180],
    zoom: 18,
    animateZoom: false,
  });

  map.setView = jest.fn();

  const control = new LeafletControl({}).addTo(map);

  control.showResult({ x: 50, y: 0 }, { query: 'none' });

  expect(map.setView).toHaveBeenCalled();
});
