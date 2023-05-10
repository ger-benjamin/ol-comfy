import { Map } from '../../src/map/map';
import { CommonProperties } from '../../src/layer/layer-group';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import OlCollection from 'ol/Collection';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import { OSM } from 'ol/source';
import { BackgroundLayerGroup, OverlayLayerGroup } from '../../src';

// Globally accessible values you need:
const layer1Id = 'layer1-id';
const backgroundLayer1Id = 'background1-id';
const map = Map.createEmptyMap();

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
const backgroundLayer1 = new OlLayerTile({
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
const overlayLayerGroup = new OverlayLayerGroup(map);
overlayLayerGroup.addLayer(layer1, layer1Id);
const backgroundLayerGroup = new BackgroundLayerGroup(map);
backgroundLayerGroup.addLayer(backgroundLayer1, backgroundLayer1Id);

// A component wanting to know changes on features for a specific layer.
overlayLayerGroup.featuresPropertyChanged.subscribe(
  (featurePropertyChanged) => {
    const layer = featurePropertyChanged[CommonProperties.LayerUid];
    const key = featurePropertyChanged.propertyKey;
    print(`Changed "${key}" in all features of layer "${layer}"`);
  }
);

// A component wanting to add another feature.
const featureX = new OlFeature({
  geometry: new OlGeomPoint([1000000, 1000000]),
});
overlayLayerGroup.addFeatures(layer1Id, [featureX]);

// A component wanting to set a property of all features.
const features = overlayLayerGroup.getFeaturesCollection(layer1Id).getArray();
overlayLayerGroup.setFeaturesProperty(layer1Id, features, 'protected', true);
