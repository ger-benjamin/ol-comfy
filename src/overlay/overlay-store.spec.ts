import OlOverlay from 'ol/Overlay';
import { MapStore } from '../map/map-store';
import { OverlayStore } from './overlay-store';
import OlMap from 'ol/Map';

describe('OverlayStore', () => {
  let map: OlMap;
  let overlayLayerGroup: OverlayStore;
  beforeEach(() => {
    // Here it's safe to use each time another instance of store as it's
    // only internal tests.
    map = MapStore.createEmptyMap();
    overlayLayerGroup = new OverlayStore(map);
  });

  it('should add, get and remove overlay to/from the map', () => {
    const overlayGroupIdA = 'overlaysA';
    const overlayGroupIdB = 'overlaysB';
    expect(map.getOverlays().getLength()).toEqual(0);

    overlayLayerGroup.addOverlay(
      overlayGroupIdA,
      new OlOverlay({ position: [0, 0] })
    );
    overlayLayerGroup.addOverlay(
      overlayGroupIdB,
      new OlOverlay({ position: [0, 0] })
    );
    expect(map.getOverlays().getLength()).toEqual(2);
    expect(overlayLayerGroup.getOverlays(overlayGroupIdA).length).toEqual(1);
    expect(overlayLayerGroup.getOverlays(overlayGroupIdB).length).toEqual(1);

    overlayLayerGroup.clearOverlaysByGroupId(overlayGroupIdA);
    expect(map.getOverlays().getLength()).toEqual(1);
    expect(overlayLayerGroup.getOverlays(overlayGroupIdA).length).toEqual(0);
    expect(overlayLayerGroup.getOverlays(overlayGroupIdB).length).toEqual(1);
  });

  // setOverlayZindex is not tested here because it needs the map to be
  // rendered in the DOM. Leave that to e2e tests.
});
