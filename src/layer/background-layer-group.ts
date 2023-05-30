import OlMap from 'ol/Map';
import { CommonProperties, LayerGroup, LayerGroupOptions } from './layer-group';
import { isNil } from 'lodash';

export const DefaultLayerBGGroupName = 'olcBackgroundLayerGroup';

/**
 * LayerGroup specialized to manage background layers (mostly tiled layers).
 * Each instance must have a unique name (one cas use the default name).
 * Default position is 0.
 */
export class BackgroundLayerGroup extends LayerGroup {
  constructor(map: OlMap, options: LayerGroupOptions = {}) {
    const layerGroupUid =
      options[CommonProperties.LayerUid] || DefaultLayerBGGroupName;
    super(map, layerGroupUid);
    const position = isNil(options.position) ? 0 : options.position;
    this.addLayerGroup(layerGroupUid, position);
  }

  /**
   * Set one background layer as visible, all others as not visible.
   */
  toggleVisible(layerUid: string) {
    const layers = this.layerGroup.getLayers().getArray();
    const foundLayer = layers.find(
      (layer) => layer.get(CommonProperties.LayerUid) === layerUid
    );
    layers.forEach((layer) => {
      this.setLayerProperty(
        layer.get(CommonProperties.LayerUid),
        CommonProperties.visible,
        layer === foundLayer
      );
    });
  }
}
