import { MapStore } from '../../src/map-store';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import { OSM } from 'ol/source';

const mapStore = new MapStore();
const viewStore = mapStore.getViewStore();
viewStore.setMapView(
  new OlView({
    center: [0, 0],
    zoom: 2,
  })
);
const backgroundLayerStore = mapStore.getBackgroundLayerStore();
backgroundLayerStore.addLayer(
  new OlLayerTile({
    source: new OSM(),
  }),
  'osm-background'
);
mapStore.getMap().setTarget('map');
