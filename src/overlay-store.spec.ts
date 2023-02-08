import OlOverlay from 'ol/Overlay';
import { MapStore } from './map-store';
import { OverlayStore } from './overlay-store';

describe('OverlayStore', () => {
  let mapStore: MapStore;
  let store: OverlayStore;
  beforeEach(() => {
    // Here it's safe to use each time another instance of store as it's only
    // internal tests.
    mapStore = new MapStore();
    store = mapStore.getOverlayStore();
  });

  it('should add, get and remove overlay to/from the map', () => {
    const overlayGroupIdA = 'overlaysA';
    const overlayGroupIdB = 'overlaysB';
    expect(mapStore.getMap().getOverlays().getLength()).toEqual(0);

    store.addOverlay(overlayGroupIdA, new OlOverlay({ position: [0, 0] }));
    store.addOverlay(overlayGroupIdB, new OlOverlay({ position: [0, 0] }));
    expect(mapStore.getMap().getOverlays().getLength()).toEqual(2);
    expect(store.getOverlays(overlayGroupIdA).length).toEqual(1);
    expect(store.getOverlays(overlayGroupIdB).length).toEqual(1);

    store.clearOverlaysByGroupId(overlayGroupIdA);
    expect(mapStore.getMap().getOverlays().getLength()).toEqual(1);
    expect(store.getOverlays(overlayGroupIdA).length).toEqual(0);
    expect(store.getOverlays(overlayGroupIdB).length).toEqual(1);
  });

  // setOverlayZindex is not tested here because it needs the map to be
  // rendered in the DOM. Leave that to e2e tests.
});
