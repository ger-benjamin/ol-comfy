import OlLayerGroup from 'ol/layer/Group.js';
import OlFeature from 'ol/Feature.js';
import OlGeomPoint from 'ol/geom/Point.js';
import OlMap from 'ol/Map.js';

export const getMap = (olcClass: unknown): OlMap => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (olcClass as any).map as OlMap;
};

/** Index 0 for background, 1 for overlay layers. */
export const getLayerGroup = (olcClass: unknown, index: number): OlLayerGroup => {
  return getMap(olcClass).getLayers().getArray()[index] as OlLayerGroup;
};

export const createDummyFeatures = (size: number): OlFeature<OlGeomPoint>[] => {
  const features = [];
  for (let i = 0; i < size; i++) {
    features.push(
      new OlFeature({
        geometry: new OlGeomPoint([828000 + i * 100, 5932736]),
      }),
    );
  }
  return features;
};
