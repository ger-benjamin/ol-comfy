import OlLayerBase from 'ol/layer/Base';
import { BackgroundLayerStore } from './background-layer-store';
import { MapStore } from '../map/map-store';
import { getLayerGroup } from '../test/test-data';
import { CommonProperties } from './layer-group-store';
import OlLayerGroup from 'ol/layer/Group';

describe('BackgroundLayersStore', () => {
  let store: BackgroundLayerStore;
  let baseLayer: OlLayerBase;
  beforeEach(() => {
    // Here it's safe to use each time another instance of store as it's
    // only internal tests.
    store = new MapStore().getBackgroundLayerStore();
    baseLayer = new OlLayerBase({});
  });

  it('should toggleVisible', (done) => {
    const secondLayer = new OlLayerBase({});
    const expectedGroup = getLayerGroup(store, 0).getLayers().getArray();
    store.addLayer(baseLayer, 'firstLayer');
    store.addLayer(secondLayer, 'secondLayer');
    expect(expectedGroup.length).toEqual(2);
    store.toggleVisible('secondLayer');
    expect(expectedGroup[0].getVisible()).toBeFalsy();
    expect(expectedGroup[1].getVisible()).toBeTruthy();
    store.toggleVisible('firstLayer');
    expect(expectedGroup[0].getVisible()).toBeTruthy();
    expect(expectedGroup[1].getVisible()).toBeFalsy();
    // Wait the events to execute this final async test
    let eventsCounter = 0;
    store.getLayerGroup().on('change', (event) => {
      // Two layers = two events.
      eventsCounter++;
      if (eventsCounter === 2) {
        const layerGroup = event.target as OlLayerGroup;
        const visibleLayer = layerGroup
          .getLayers()
          .getArray()
          .find((layer) => layer.getVisible());
        expect(visibleLayer?.get(CommonProperties.LayerID)).toEqual(
          'secondLayer'
        );
        done();
      }
    });
    store.toggleVisible('secondLayer');
  });
});
