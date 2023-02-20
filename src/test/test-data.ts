import OlLayerGroup from 'ol/layer/Group';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import OlMap from 'ol/Map';

export const getMap = (olcClass: any): OlMap => {
  return olcClass.map as OlMap;
};

/** Index 0 for background, 1 for overlay layers. */
export const getLayerGroup = (
  olcClass: unknown,
  index: number
): OlLayerGroup => {
  return getMap(olcClass).getLayers().getArray()[index] as OlLayerGroup;
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
