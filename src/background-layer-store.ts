import OlLayerGroup from 'ol/layer/Group';
import OlMap from 'ol/Map';
import {
  LayerGroupStore,
  CommonProperties,
  LayerGroups,
} from './layer-group-store';

/**
 * Storage for the state of the background layers in the map.
 */
export class BackgroundLayerStore extends LayerGroupStore {
  constructor(map: OlMap) {
    super(map);
    this.layerGroup = new OlLayerGroup({
      properties: {
        [CommonProperties.LayerID]: LayerGroups.Background,
      },
    });
    map.addLayer(this.layerGroup);
  }

  /**
   * Set one background layer as visible, all others as not visible
   */
  toggleVisible(layerId: string) {
    const layers = this.layerGroup.getLayers().getArray();
    const foundLayer = layers.find(
      (layer) => layer.get(CommonProperties.LayerID) === layerId
    );
    layers.forEach((layer) => {
      layer.setVisible(layer === foundLayer);
    });
  }
}
