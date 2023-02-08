import OlLayerBase from 'ol/layer/Base';
import { MapStore } from './map-store';
import { LayerGroupStore } from './layer-group-store';
import { getLayerGroup } from './test-data';
import OlLayerLayer from 'ol/layer/Layer';
import OlSourceSource from 'ol/source/Source';

describe('LayersStore', () => {
  let store: LayerGroupStore;
  let baseLayer: OlLayerBase;
  beforeEach(() => {
    // Here it's safe to use each time another instance of storeMap as it's
    // only internal tests. Use one backgroundLayerStore to test LayerGroupStore
    // (parent).
    store = new MapStore().getBackgroundLayerStore();
    baseLayer = new OlLayerBase({});
  });

  it('should addLayer', (done) => {
    store.layerAdded.subscribe((layer) => {
      expect(layer).toEqual(baseLayer);
      done();
    });
    store.addLayer(baseLayer, 'myLayer');
    expect(getLayerGroup(store, 0).getLayers().getLength()).toEqual(1);
  });

  it('should clearAll', () => {
    store.addLayer(baseLayer, 'myLayer');
    expect(getLayerGroup(store, 0).getLayers().getLength()).toEqual(1);
    store.clearAll();
    expect(getLayerGroup(store, 0).getLayers().getLength()).toEqual(0);
  });

  it('should fail addLayer', () => {
    const group = getLayerGroup(store, 0).getLayers().getArray();
    store.addLayer(baseLayer, 'myLayer');
    expect(group.length).toEqual(1);
    // Same layerId => fail
    store.addLayer(baseLayer, 'myLayer');
    expect(group.length).toEqual(1);
    // Invalid empty name => fail
    store.addLayer(baseLayer, '');
    expect(group.length).toEqual(1);
    // @ts-ignore: Could happen on runtime
    store.addLayer(null, 'anotherLayer');
    expect(group.length).toEqual(1);
  });

  it('should getAllSources', () => {
    const layerWithSource = new OlLayerLayer({
      source: new OlSourceSource({}),
    });
    store.addLayer(baseLayer, 'myLayer1');
    store.addLayer(layerWithSource, 'myLayer2');
    expect(store.getLayerGroup().getLayers().getLength()).toEqual(2);
    expect(store.getAllSources().length).toEqual(1);
  });

  it('should getAttributions', () => {
    const createLayer = (attribution: string) =>
      new OlLayerLayer({
        source: new OlSourceSource({ attributions: attribution }),
      });
    const layers = [
      createLayer('attr1'),
      createLayer('attr2'),
      createLayer('attr3'),
      createLayer('attr1'),
    ];
    layers[2].setVisible(false);
    layers.forEach((layer, index) => store.addLayer(layer, `${index}`));
    expect(store.getAttributions()).toEqual(['attr1', 'attr2']);
  });
});
