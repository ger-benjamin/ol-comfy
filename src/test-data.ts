import OlLayerGroup from 'ol/layer/Group';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import OlMap from 'ol/Map';

export const getMap = (store: any): OlMap => {
  return store.map as OlMap;
};

/** Index 0 for background, 1 for overlay layers. */
export const getLayerGroup = (store: unknown, index: number): OlLayerGroup => {
  return getMap(store).getLayers().getArray()[index] as OlLayerGroup;
};

export const createDummyFeatures = (size: number): OlFeature<OlGeomPoint>[] => {
  const features = [];
  for (let i = 0; i < size; i++) {
    features.push(
      new OlFeature({
        geometry: new OlGeomPoint([828000 + i * 100, 5932736]),
      })
    );
  }
  return features;
};
