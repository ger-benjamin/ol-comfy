import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import { OverlayLayerStore } from './overlay-layer-store';
import { MapStore } from './map-store';
import { CommonProperties } from './layer-group-store';
import OlSourceCluster from 'ol/source/Cluster';
import OlCollection from 'ol/Collection';

describe('OverlayLayersStore', () => {
  let mapStore: MapStore;
  let store: OverlayLayerStore;
  let overlayLayer: OlLayerVector<any>;
  beforeEach(() => {
    // Here it's safe to use each time another instance of store as it's only
    // internal tests.
    mapStore = new MapStore();
    store = mapStore.getOverlayLayerStore();
    overlayLayer = new OlLayerVector({
      source: new OlSourceVector({
        useSpatialIndex: false,
      }),
    });
  });

  describe('getVectorSource method', () => {
    const layerId = 'vector-overlay';
    beforeEach(() => {
      store.addLayer(overlayLayer, layerId);
    });

    it('It should getVectorSource with vector source', () => {
      expect(store.getVectorSource(layerId)).toBeTruthy();
    });

    it('It should getVectorSource with cluster source', () => {
      const clusterLayerId = 'cluster-overlay';
      const clusterLayer = new OlLayerVector({
        source: new OlSourceCluster({
          source: new OlSourceVector({
            useSpatialIndex: false,
          }),
        }),
      });
      store.addLayer(clusterLayer, clusterLayerId);
      expect(store.getVectorSource(clusterLayerId)).toBeTruthy();
    });
  });

  describe('should setFeatures', () => {
    const layerId = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([]) }),
      new OlFeature({ geometry: new OlGeomPoint([]) }),
    ];

    beforeEach(() => {
      store.addLayer(overlayLayer, layerId);
    });

    it('can not set features in a not existing layer', () => {
      store.setFeatures('foo', features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
    });

    it('can set features', () => {
      // Correct layer and features, add features.
      store.setFeatures(layerId, features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(2);
      // One feature, set and emit.
      store.setFeatures(layerId, []);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
    });
  });

  describe('should addFeatures', () => {
    const layerId = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([]) }),
      new OlFeature({ geometry: new OlGeomPoint([]) }),
    ];

    beforeEach(() => {
      store.addLayer(overlayLayer, layerId);
    });

    it('can not add features in a not existing layer', () => {
      store.addFeatures('foo', features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
    });

    it('can does not throw error adding twice a features', () => {
      store.addFeatures(layerId, [features[0]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(1);
      // try adding already existing one
      store.addFeatures(layerId, [features[0]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(1);
    });

    it('can add features', () => {
      store.addFeatures(layerId, [features[0]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(1);
      store.addFeatures(layerId, [features[1]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(2);
    });
  });

  describe('should removeFeatures', () => {
    const layerId = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([]) }),
      new OlFeature({ geometry: new OlGeomPoint([]) }),
    ];

    beforeEach(() => {
      store.addLayer(overlayLayer, layerId);
      store.addFeatures(layerId, features);
    });

    it('can not remove features in a not existing layer', () => {
      store.removeFeatures('foo', features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(2);
    });

    it('can remove features', () => {
      store.removeFeatures(layerId, [features[0]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(1);
      store.removeFeatures(layerId, features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
    });
  });

  describe('should getFeatureExtents', () => {
    const layerId = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([0, 1000]) }),
      new OlFeature({ geometry: new OlGeomPoint([3000, -1000]) }),
    ];
    const expectedExtent = [0, -1000, 3000, 1000];

    it('should getLayerFeatureExtents', () => {
      store.addLayer(overlayLayer, layerId);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
      expect(store.getLayerFeaturesExtent(layerId)).toBeNull();
      store.addFeatures(layerId, features);
      expect(store.getLayerFeaturesExtent(layerId)).toEqual(expectedExtent);
    });

    it('should getFeatureExtents', () => {
      const overlayLayer2 = new OlLayerVector({
        source: new OlSourceVector({
          useSpatialIndex: false,
        }),
      });
      store.addLayer(overlayLayer, layerId);
      store.addLayer(overlayLayer2, 'layer2');
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
      expect(store.getFeaturesExtent()).toBeNull();
      store.addFeatures(layerId, features);
      expect(store.getFeaturesExtent()).toEqual(expectedExtent);
    });
  });

  it('should emitSelectFeatures', (done) => {
    const layerId = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([3000, -1000]) }),
    ];
    store.featuresSelected.subscribe((evt) => {
      expect(evt[CommonProperties.LayerID]).toBe(layerId);
      expect(evt.selected.length).toEqual(0);
      expect(evt.deselected).toBe(features);
      done();
    });
    store.emitSelectFeatures(layerId, [], features);
  });

  it('should setFeaturesProperty', () => {
    const layerId = 'test';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([0, 1000]) }),
      new OlFeature({ geometry: new OlGeomPoint([3000, -1000]) }),
    ];
    const propertyKey = 'foo';
    const propertyValue = 'bar';
    expect(features.map((feature) => feature.get(propertyKey))).toEqual([
      undefined,
      undefined,
    ]);
    store.setFeaturesProperty(layerId, features, propertyKey, propertyValue);
    expect(features.map((feature) => feature.get(propertyKey))).toEqual([
      propertyValue,
      propertyValue,
    ]);
  });

  it('should emitFeaturePropertyChanged', (done) => {
    const layerId = 'test';
    const features = [new OlFeature({ geometry: new OlGeomPoint([0, 1000]) })];
    const propertyKey = 'foo';
    const propertyValue = 'bar';
    store.featuresPropertyChanged.subscribe((evt) => {
      expect(evt[CommonProperties.LayerID]).toBe(layerId);
      expect(evt.propertyKey).toBe('foo');
      done();
    });
    store.setFeaturesProperty(layerId, features, propertyKey, propertyValue);
  });

  it('should return empty cluster array', () => {
    const layerId = 'cluster';
    const clusterLayer = new OlLayerVector({
      source: new OlSourceCluster({
        source: new OlSourceVector({
          features: new OlCollection(),
        }),
      }),
    });
    store.addLayer(clusterLayer, layerId);
    expect(store.getClusterFeatures(layerId)?.length).toEqual(0);
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([]) }),
      new OlFeature({ geometry: new OlGeomPoint([]) }),
    ];
    store.addFeatures(layerId, features);
    // Should return an empty array, as clusters are only created if the map is
    // actually rendered
    expect(store.getClusterFeatures(layerId)?.length).toEqual(0);
  });
});
