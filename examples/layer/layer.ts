import { CommonProperties } from '../../src/layer/layer-group-store';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import OlCollection from 'ol/Collection';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import { OSM } from 'ol/source';
import storesManager from '../../lib/examples/common/stores-manager';

const create = () => {
  // Globally accessible values you need:
  const layer1Id = 'layer1-id';
  const backgroundlLayer1Id = 'background1-id';
  const mapStore = storesManager.getMapStore('toto');

  // Setup example.
  const createLayers = (i: number) => {
    const random = Math.random() * 2000000;
    return new OlLayerVector({
      source: new OlSourceVector({
        features: new OlCollection([
          new OlFeature({
            geometry: new OlGeomPoint([-10000000 + i * 200000, random]),
          }),
        ]),
      }),
    });
  };
  const backgroundlayer1 = new OlLayerTile({
    source: new OSM(),
  });
  const print = (msg) => {
    document.querySelector('#console .text').textContent = msg;
  };

  // Below: Use ol-comfy.
  // Your controller initializing the map.
  mapStore.getViewStore().setMapView(
    new OlView({
      center: [0, 0],
      zoom: 2,
    })
  );
  mapStore.getMap().setTarget('map');

  // Your controller initializing the layers.
  Array.from(Array(100)).map((x, i) => {
    mapStore
      .getOverlayLayerStore()
      .addLayer(createLayers(i), `${layer1Id}-${i}`);
  });
  mapStore
    .getBackgroundLayerStore()
    .addLayer(backgroundlayer1, backgroundlLayer1Id);

  // A component wanting to know changes on features for a specific layer.
  mapStore
    .getOverlayLayerStore()
    .featuresPropertyChanged.subscribe((featurePropertyChanged) => {
      const layer = featurePropertyChanged[CommonProperties.LayerID];
      const key = featurePropertyChanged.propertyKey;
      print(`Changed "${key}" in all features of layer "${layer}"`);
    });
};

const destroy = () => {
  storesManager.getMapStore('toto').getMap().setTarget('');
  storesManager.destroyStores('toto');
};

window['create'] = create;
window['destroy'] = destroy;
