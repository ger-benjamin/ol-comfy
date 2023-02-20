import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import storeManager from './store-manager';
import OlControlZoom from 'ol/control/Zoom';
import { BackgroundLayer, Map } from '../../src';

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
const map1 = storeManager.getMapStore(storesId1);
map1.setTarget('map1');
map1.setView(view1);
let backgroundLayer = new BackgroundLayer(map1);
backgroundLayer.addLayer(backgroundlayer1, backgroundlLayer1Id);
let map2 = storeManager.getMapStore(storesId2);
map2.setTarget('map2');
map2.setView(view2);
backgroundLayer = new BackgroundLayer(map2);
backgroundLayer.addLayer(backgroundlayer2, backgroundlLayer2Id);

// A component adding a control on one map.
map2 = storeManager.getMapStore(storesId2);
const olcMap = new Map(map2);
olcMap.addControl('scalebare', new OlControlZoom());
