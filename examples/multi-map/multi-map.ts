import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import storeManager from './store-manager';
import OlControlZoom from 'ol/control/Zoom';

// Globally accessible values you need:
const storesId1 = 'store-1';
const storesId2 = 'store-2';
const backgroundlLayer1Id = 'background1-id';
const backgroundlLayer2Id = 'background2-id';

// Setup example.
const backgroundlayer1 = new OlLayerTile({
  source: new OSM(),
});
const backgroundlayer2 = new OlLayerTile({
  source: new OSM(),
});
const view1 = new OlView({
  center: [0, 0],
  zoom: 5,
});
const view2 = new OlView({
  center: [0, 0],
  zoom: 2,
});

// Below: Use ol-comfy.
// Your controller initializing multiple map.
const store1 = storeManager.getMapStore(storesId1);
store1.getMap().setTarget('map1');
store1.getViewStore().setMapView(view1);
store1
  .getBackgroundLayerStore()
  .addLayer(backgroundlayer1, backgroundlLayer1Id);
let store2 = storeManager.getMapStore(storesId2);
store2.getMap().setTarget('map2');
store2.getViewStore().setMapView(view2);
store2
  .getBackgroundLayerStore()
  .addLayer(backgroundlayer2, backgroundlLayer2Id);

// A component adding a control on one map.
store2 = storeManager.getMapStore(storesId2);
store2.addControl('scalebare', new OlControlZoom());
