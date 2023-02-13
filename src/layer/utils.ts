import OlFormatWMTSCapabilities from 'ol/format/WMTSCapabilities';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import { Geometry as OlGeometry } from 'ol/geom';
import OlFeature from 'ol/Feature';
import RenderFeature from 'ol/render/Feature';
import OlStyle from 'ol/style/Style';

/**
 * Parse a capabilities string document and returns a capabilities object with
 * it.
 */
export const parseWMTSCapabilities = (
  wmtsCapabilities: string
): Record<string, unknown> => {
  const parserWMTSCapabilities = new OlFormatWMTSCapabilities();
  return parserWMTSCapabilities.read(wmtsCapabilities);
};

/**
 * Set the style of a layer (only) once.
 */
export const updateLayerStyle = (
  layer: OlLayerVector<OlSourceVector<OlGeometry>>,
  styleFn: (
    feature: OlFeature<OlGeometry> | RenderFeature
  ) => OlStyle | OlStyle[]
) => {
  if (layer.get('draw-style-set')) {
    return;
  }
  layer.setStyle(styleFn);
  layer.set('draw-style-set', true);
};
