import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import { OverlayLayerStore } from './overlay-layer-store';
import { MapStore } from '../map/map-store';
import { CommonProperties } from './layer-group-store';
import OlSourceCluster from 'ol/source/Cluster';
import OlCollection from 'ol/Collection';

describe('OverlayLayersStore', () => {
  let overlayLayerGroup: OverlayLayerStore;
  let overlayLayer: OlLayerVector<any>;
  beforeEach(() => {
    // Here it's safe to use each time another instance of store as it's
    // only internal tests.
    overlayLayerGroup = new OverlayLayerStore(MapStore.createEmptyMap());
    overlayLayer = new OlLayerVector({
      source: new OlSourceVector({
        useSpatialIndex: false,
      }),
    });
  });

  describe('getVectorSource method', () => {
    const layerUid = 'vector-overlay';
    beforeEach(() => {
      overlayLayerGroup.addLayer(overlayLayer, layerUid);
    });

    it('It should getVectorSource with vector source', () => {
      expect(overlayLayerGroup.getVectorSource(layerUid)).toBeTruthy();
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
      overlayLayerGroup.addLayer(clusterLayer, clusterLayerId);
      expect(overlayLayerGroup.getVectorSource(clusterLayerId)).toBeTruthy();
    });
  });

  describe('should setFeatures', () => {
    const layerUid = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([]) }),
      new OlFeature({ geometry: new OlGeomPoint([]) }),
    ];

    beforeEach(() => {
      overlayLayerGroup.addLayer(overlayLayer, layerUid);
    });

    it('can not set features in a not existing layer', () => {
      overlayLayerGroup.setFeatures('foo', features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
    });

    it('can set features', () => {
      // Correct layer and features, add features.
      overlayLayerGroup.setFeatures(layerUid, features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(2);
      // One feature, set and emit.
      overlayLayerGroup.setFeatures(layerUid, []);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
    });
  });

  describe('should addFeatures', () => {
    const layerUid = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([]) }),
      new OlFeature({ geometry: new OlGeomPoint([]) }),
    ];

    beforeEach(() => {
      overlayLayerGroup.addLayer(overlayLayer, layerUid);
    });

    it('can not add features in a not existing layer', () => {
      overlayLayerGroup.addFeatures('foo', features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
    });

    it('can does not throw error adding twice a features', () => {
      overlayLayerGroup.addFeatures(layerUid, [features[0]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(1);
      // try adding already existing one
      overlayLayerGroup.addFeatures(layerUid, [features[0]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(1);
    });

    it('can add features', () => {
      overlayLayerGroup.addFeatures(layerUid, [features[0]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(1);
      overlayLayerGroup.addFeatures(layerUid, [features[1]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(2);
    });
  });

  describe('should removeFeatures', () => {
    const layerUid = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([]) }),
      new OlFeature({ geometry: new OlGeomPoint([]) }),
    ];

    beforeEach(() => {
      overlayLayerGroup.addLayer(overlayLayer, layerUid);
      overlayLayerGroup.addFeatures(layerUid, features);
    });

    it('can not remove features in a not existing layer', () => {
      overlayLayerGroup.removeFeatures('foo', features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(2);
    });

    it('can remove features', () => {
      overlayLayerGroup.removeFeatures(layerUid, [features[0]]);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(1);
      overlayLayerGroup.removeFeatures(layerUid, features);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
    });
  });

  describe('should getFeatureExtents', () => {
    const layerUid = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([0, 1000]) }),
      new OlFeature({ geometry: new OlGeomPoint([3000, -1000]) }),
    ];
    const expectedExtent = [0, -1000, 3000, 1000];

    it('should getLayerFeatureExtents', () => {
      overlayLayerGroup.addLayer(overlayLayer, layerUid);
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
      expect(overlayLayerGroup.getLayerFeaturesExtent(layerUid)).toBeNull();
      overlayLayerGroup.addFeatures(layerUid, features);
      expect(overlayLayerGroup.getLayerFeaturesExtent(layerUid)).toEqual(
        expectedExtent
      );
    });

    it('should getFeatureExtents', () => {
      const overlayLayer2 = new OlLayerVector({
        source: new OlSourceVector({
          useSpatialIndex: false,
        }),
      });
      overlayLayerGroup.addLayer(overlayLayer, layerUid);
      overlayLayerGroup.addLayer(overlayLayer2, 'layer2');
      expect(overlayLayer.getSource().getFeatures().length).toEqual(0);
      expect(overlayLayerGroup.getFeaturesExtent()).toBeNull();
      overlayLayerGroup.addFeatures(layerUid, features);
      expect(overlayLayerGroup.getFeaturesExtent()).toEqual(expectedExtent);
    });
  });

  it('should emitSelectFeatures', (done) => {
    const layerUid = 'overlay';
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([3000, -1000]) }),
    ];
    overlayLayerGroup.featuresSelected.subscribe((evt) => {
      expect(evt[CommonProperties.LayerUid]).toBe(layerUid);
      expect(evt.selected.length).toEqual(0);
      expect(evt.deselected).toBe(features);
      done();
    });
    overlayLayerGroup.emitSelectFeatures(layerUid, [], features);
  });

  it('should setFeaturesProperty', () => {
    const layerUid = 'test';
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
    overlayLayerGroup.setFeaturesProperty(
      layerUid,
      features,
      propertyKey,
      propertyValue
    );
    expect(features.map((feature) => feature.get(propertyKey))).toEqual([
      propertyValue,
      propertyValue,
    ]);
  });

  it('should emitFeaturePropertyChanged', (done) => {
    const layerUid = 'test';
    const features = [new OlFeature({ geometry: new OlGeomPoint([0, 1000]) })];
    const propertyKey = 'foo';
    const propertyValue = 'bar';
    overlayLayerGroup.featuresPropertyChanged.subscribe((evt) => {
      expect(evt[CommonProperties.LayerUid]).toBe(layerUid);
      expect(evt.propertyKey).toBe('foo');
      done();
    });
    overlayLayerGroup.setFeaturesProperty(
      layerUid,
      features,
      propertyKey,
      propertyValue
    );
  });

  it('should return empty cluster array', () => {
    const layerUid = 'cluster';
    const clusterLayer = new OlLayerVector({
      source: new OlSourceCluster({
        source: new OlSourceVector({
          features: new OlCollection(),
        }),
      }),
    });
    overlayLayerGroup.addLayer(clusterLayer, layerUid);
    expect(overlayLayerGroup.getClusterFeatures(layerUid)?.length).toEqual(0);
    const features = [
      new OlFeature({ geometry: new OlGeomPoint([]) }),
      new OlFeature({ geometry: new OlGeomPoint([]) }),
    ];
    overlayLayerGroup.addFeatures(layerUid, features);
    // Should return an empty array, as clusters are only created if the
    // map is actually rendered
    expect(overlayLayerGroup.getClusterFeatures(layerUid)?.length).toEqual(0);
  });
});
