import OlLayerBase from 'ol/layer/Base';
import { MapStore } from '../map/map-store';
import { LayerGroupStore } from './layer-group-store';
import { getLayerGroup } from '../test/test-data';
import OlLayerLayer from 'ol/layer/Layer';
import OlSourceSource from 'ol/source/Source';
import { BackgroundLayerStore } from './background-layer-store';

describe('LayersStore', () => {
  let layerGroup: LayerGroupStore;
  let baseLayer: OlLayerBase;
  beforeEach(() => {
    // Here it's safe to use each time another instance of storeMap as it's
    // only internal tests. Use one backgroundLayerStore to test
    // LayerGroupStore (parent).
    layerGroup = new BackgroundLayerStore(MapStore.createEmptyMap());
    baseLayer = new OlLayerBase({});
  });

  it('should addLayer', (done) => {
    layerGroup.layerAdded.subscribe((layer) => {
      expect(layer).toEqual(baseLayer);
      done();
    });
    layerGroup.addLayer(baseLayer, 'myLayer');
    expect(getLayerGroup(layerGroup, 0).getLayers().getLength()).toEqual(1);
  });

  it('should clearAll', () => {
    layerGroup.addLayer(baseLayer, 'myLayer');
    expect(getLayerGroup(layerGroup, 0).getLayers().getLength()).toEqual(1);
    layerGroup.clearAll();
    expect(getLayerGroup(layerGroup, 0).getLayers().getLength()).toEqual(0);
  });

  it('should fail addLayer', () => {
    const group = getLayerGroup(layerGroup, 0).getLayers().getArray();
    layerGroup.addLayer(baseLayer, 'myLayer');
    expect(group.length).toEqual(1);
    // Same layerUid => fail
    layerGroup.addLayer(baseLayer, 'myLayer');
    expect(group.length).toEqual(1);
    // Invalid empty name => fail
    layerGroup.addLayer(baseLayer, '');
    expect(group.length).toEqual(1);
    // @ts-ignore: Could happen on runtime
    layerGroup.addLayer(null, 'anotherLayer');
    expect(group.length).toEqual(1);
  });

  it('should getAllSources', () => {
    const layerWithSource = new OlLayerLayer({
      source: new OlSourceSource({}),
    });
    layerGroup.addLayer(baseLayer, 'myLayer1');
    layerGroup.addLayer(layerWithSource, 'myLayer2');
    expect(layerGroup.getLayerGroup().getLayers().getLength()).toEqual(2);
    expect(layerGroup.getAllSources().length).toEqual(1);
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
    layers.forEach((layer, index) => layerGroup.addLayer(layer, `${index}`));
    expect(layerGroup.getAttributions()).toEqual(['attr1', 'attr2']);
  });
});
