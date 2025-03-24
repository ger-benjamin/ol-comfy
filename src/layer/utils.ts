import OlFormatWMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import OlLayerVector from 'ol/layer/Vector.js';
import OlSourceVector from 'ol/source/Vector.js';
import { Geometry as OlGeometry } from 'ol/geom.js';
import OlFeature from 'ol/Feature.js';
import RenderFeature from 'ol/render/Feature.js';
import OlStyle from 'ol/style/Style.js';

/**
 * Parse a capabilities string document and returns a capabilities object with
 * it.
 */
export const parseWMTSCapabilities = (
  wmtsCapabilities: string,
): Record<string, unknown> => {
  const parserWMTSCapabilities = new OlFormatWMTSCapabilities();
  return parserWMTSCapabilities.read(wmtsCapabilities);
};

/**
 * Set the style of a layer (only) once.
 */
export const updateLayerStyle = (
  layer: OlLayerVector<OlSourceVector<OlFeature>>,
  styleFn: (feature: OlFeature<OlGeometry> | RenderFeature) => OlStyle | OlStyle[],
) => {
  if (layer.get('draw-style-set')) {
    return;
  }
  layer.setStyle(styleFn);
  layer.set('draw-style-set', true);
};
