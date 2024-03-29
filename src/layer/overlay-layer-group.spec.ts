import OlLayerVector from 'ol/layer/Vector';
import OlTileLayer from 'ol/layer/Tile';
import OlSourceVector from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import { OverlayLayerGroup } from './overlay-layer-group';
import { Map } from '../map/map';
import { CommonProperties } from './layer-group';
import OlSourceCluster from 'ol/source/Cluster';
import OlCollection from 'ol/Collection';

describe('OverlayLayerGroup', () => {
  let overlayLayerGroup: OverlayLayerGroup;
  let overlayLayer: OlLayerVector<any>;
  const tileLayerUid = 'tile-layer-id';

  beforeEach(() => {
    overlayLayerGroup = new OverlayLayerGroup(Map.createEmptyMap());
    overlayLayer = new OlLayerVector({
      source: new OlSourceVector({
        useSpatialIndex: false,
      }),
    });
    // Add a tile layer to prove that it doesn't affect tests of method
    // dedicated to layer with vector source and features.
    overlayLayerGroup.addLayer(new OlTileLayer(), tileLayerUid);
  });

  describe('getVectorLayer', () => {
    const layerUid = 'vector-overlay';

    beforeEach(() => {
      overlayLayerGroup.addLayer(overlayLayer, layerUid);
    });

    it('should getVectorLayer on vector layer', () => {
      expect(overlayLayerGroup.getVectorLayer(layerUid)).not.toBeNull();
    });

    it('should getVectorLayer on tile layer', () => {
      expect(overlayLayerGroup.getVectorLayer(tileLayerUid)).toBeNull();
    });
  });

  describe('getVectorSource and getEndVectorSource methods', () => {
    const layerUid = 'vector-overlay';
    const clusterLayerUid = 'cluster-overlay';

    beforeEach(() => {
      const clusterLayer = new OlLayerVector({
        source: new OlSourceCluster({
          source: new OlSourceVector({
            useSpatialIndex: false,
          }),
        }),
      });
      overlayLayerGroup.addLayer(overlayLayer, layerUid);
      overlayLayerGroup.addLayer(clusterLayer, clusterLayerUid);
    });

    it('should getVectorSource with vector source', () => {
      expect(overlayLayerGroup.getVectorSource(layerUid)).toBeTruthy();
    });

    it('should getEndVectorSource with vector source', () => {
      expect(overlayLayerGroup.getEndVectorSource(layerUid)).toBeTruthy();
    });

    it('should getVectorSource with cluster source', () => {
      const layer = overlayLayerGroup.getVectorSource(clusterLayerUid);
      expect(layer).toBeTruthy();
      expect(layer).toBeInstanceOf(OlSourceCluster);
    });

    it('should getEndVectorSource with cluster source', () => {
      const layer = overlayLayerGroup.getEndVectorSource(clusterLayerUid);
      expect(layer).toBeTruthy();
      expect(layer).not.toBeInstanceOf(OlSourceCluster);
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
