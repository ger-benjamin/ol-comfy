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

// Globally accessible values you need:
const mapStore = new MapStore();
const layer1Id = 'layer1-id';
const backgroundlLayer1Id = 'background1-id';

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

// Below: Use ol-comfy.
// Your controller initializing the map.
const viewStore = mapStore.getViewStore();
viewStore.setMapView(
  new OlView({
    center: [0, 0],
    zoom: 2,
  })
);
mapStore.getMap().setTarget('map');

// Your controller initializing the layers.
const overlayLayerStore = mapStore.getOverlayLayerStore();
overlayLayerStore.addLayer(layer1, layer1Id);
const backgroundLayerStore = mapStore.getBackgroundLayerStore();
backgroundLayerStore.addLayer(backgroundlayer1, backgroundlLayer1Id);

// A component wanting to know changes on features for a specific layer.
overlayLayerStore.featuresPropertyChanged.subscribe(
  (featurePropertyChanged) => {
    const layer = featurePropertyChanged[CommonProperties.LayerID];
    const key = featurePropertyChanged.propertyKey;
    print(`Changed "${key}" in all features of layer "${layer}"`);
  }
);

// A component wanting to add another feature.
const featureX = new OlFeature({
  geometry: new OlGeomPoint([1000000, 1000000]),
});
overlayLayerStore.addFeatures(layer1Id, [featureX]);

// A component wanting to set a property of all features.
const features = overlayLayerStore.getFeaturesCollection(layer1Id).getArray();
overlayLayerStore.setFeaturesProperty(layer1Id, features, 'protected', true);
