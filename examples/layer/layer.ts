import { MapStore } from '../../src/map/map-store';
import { CommonProperties } from '../../src/layer/layer-group-store';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import OlCollection from 'ol/Collection';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import { OSM } from 'ol/source';
import { BackgroundLayerStore, OverlayLayerStore } from '../../src';

// Globally accessible values you need:
const layer1Id = 'layer1-id';
const backgroundlLayer1Id = 'background1-id';
const map = MapStore.createEmptyMap();

// Setup example.
const layer1 = new OlLayerVector({
  source: new OlSourceVector({
    features: new OlCollection([
      new OlFeature({
        geometry: new OlGeomPoint([0, 0]),
      }),
    ]),
  }),
});
const backgroundlayer1 = new OlLayerTile({
  source: new OSM(),
});
const print = (msg) => {
  document.querySelector('#console .text').textContent = msg;
};

// Your controller initializing the map.
map.setView(
  new OlView({
    center: [0, 0],
    zoom: 2,
  })
);
map.setTarget('map');

// Below: Use ol-comfy.
// Your controller initializing the layers.
const overlayLayer = new OverlayLayerStore(map);
overlayLayer.addLayer(layer1, layer1Id);
const backgroundLayer = new BackgroundLayerStore(map);
backgroundLayer.addLayer(backgroundlayer1, backgroundlLayer1Id);

// A component wanting to know changes on features for a specific layer.
overlayLayer.featuresPropertyChanged.subscribe((featurePropertyChanged) => {
  const layer = featurePropertyChanged[CommonProperties.LayerUid];
  const key = featurePropertyChanged.propertyKey;
  print(`Changed "${key}" in all features of layer "${layer}"`);
});

// A component wanting to add another feature.
const featureX = new OlFeature({
  geometry: new OlGeomPoint([1000000, 1000000]),
});
overlayLayer.addFeatures(layer1Id, [featureX]);

// A component wanting to set a property of all features.
const features = overlayLayer.getFeaturesCollection(layer1Id).getArray();
overlayLayer.setFeaturesProperty(layer1Id, features, 'protected', true);
