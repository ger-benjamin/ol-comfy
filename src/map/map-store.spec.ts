import { MapStore } from './map-store';
import { ScaleLine } from 'ol/control';

describe('MapStore', () => {
  let olcMap: MapStore;
  beforeEach(() => {
    // Here it's safe to use each time another instance of store as it's
    // only internal tests.
    olcMap = new MapStore(MapStore.createEmptyMap());
  });

  it('should be created and instanced', () => {
    expect(olcMap).toBeTruthy();
    expect(olcMap.getMap()).toBeTruthy();
    expect(olcMap.getMap().getControls().getLength()).toEqual(0);
    expect(olcMap.getMap().getLayers().getLength()).toEqual(0);
  });

  // 'getAttributions' is already tested in layers-store

  it('should add control to the map', () => {
    const controlId = 'test_control';
    expect(olcMap.getMap().getControls().getArray().length).toEqual(0);
    olcMap.addControl(controlId, new ScaleLine());
    expect(olcMap.getMap().getControls().getArray().length).toEqual(1);
    olcMap.addControl(controlId, new ScaleLine());
    expect(olcMap.getMap().getControls().getArray().length).toEqual(1);
    olcMap.addControl(controlId + 'X', new ScaleLine());
    expect(olcMap.getMap().getControls().getArray().length).toEqual(2);
  });
});
