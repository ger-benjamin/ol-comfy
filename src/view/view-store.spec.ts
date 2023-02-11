import OlView from 'ol/View';
import { MapStore } from '../map/map-store';
import { ViewStore } from './view-store';
import { OPENLAYERS_ANIMATION_DELAY } from '../const-from-outside';

/* Standard OpenLayers animation duration is 250ms. Add 50 more to be sure. */
const ANIMATION_WAIT_TIME = OPENLAYERS_ANIMATION_DELAY + 50;

describe('ViewStore', () => {
  let store: ViewStore;

  beforeEach(() => {
    // Here it's safe to use each time another instance of store as it's
    // only internal tests.
    store = new MapStore().getViewStore();
  });

  it('should setMapView', () => {
    // A map always has a view.
    expect(store.getView()).toBeTruthy();
    expect(store.getView().getZoom()).toBeUndefined();
    store.setMapView(new OlView({ zoom: 2 }));
    expect(store.getView().getZoom()).toEqual(2);
  });

  // Can't test "fit" easily because no map is rendered. Leave that to the
  // end-to-end tests.

  it('should zoom in', (done) => {
    store.setMapView(new OlView({ center: [0, 0], zoom: 2 }));
    store.zoom(1);
    // Let time to the map to zoom
    setTimeout(() => {
      expect(store.getView().getZoom()).toEqual(3);
      done();
    }, ANIMATION_WAIT_TIME);
  });

  it('should zoom out', (done) => {
    store.setMapView(new OlView({ center: [0, 0], zoom: 2 }));
    // Exaggerate zoom out. Should work, but goes to zoom level 0.
    store.zoom(-1000);
    // Let time to the map to zoom
    setTimeout(() => {
      expect(store.getView().getZoom()).toEqual(0);
      done();
    }, ANIMATION_WAIT_TIME);
  });
});
