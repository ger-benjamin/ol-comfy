import { MapStore } from './map-store';
import { ScaleLine } from 'ol/control';

describe('MapStore', () => {
  let store: MapStore;
  beforeEach(() => {
    // Here it's safe to use each time another instance of store as it's only
    // internal tests.
    store = new MapStore();
  });

  it('should be created and instanced', () => {
    expect(store).toBeTruthy();
    expect(store.getMap()).toBeTruthy();
    expect(store.getMap().getLayers().getLength()).toEqual(2);
  });

  // 'getAttributions' is already tested in layers-store

  it('should add control to the map', () => {
    const controlId = 'test_control';
    expect(store.getMap().getControls().getArray().length).toEqual(0);
    store.addControl(controlId, new ScaleLine());
    expect(store.getMap().getControls().getArray().length).toEqual(1);
    store.addControl(controlId, new ScaleLine());
    expect(store.getMap().getControls().getArray().length).toEqual(1);
    store.addControl(controlId + 'X', new ScaleLine());
    expect(store.getMap().getControls().getArray().length).toEqual(2);
  });
});
