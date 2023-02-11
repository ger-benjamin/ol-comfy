import OlMap from 'ol/Map';
import OlCollection from 'ol/Collection';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerBase from 'ol/layer/Base';
import { flatten, isNil, uniq } from 'lodash';
import OlLayerLayer from 'ol/layer/Layer';
import OlSourceSource from 'ol/source/Source';
import { FrameState as OlFrameState } from 'ol/PluggableMap';
import { Subject } from 'rxjs';

/**
 * Existing layers groups at the root of the map.layers.
 */
export enum LayerGroups {
  Background = 'Background',
  Overlay = 'Overlay',
}

/**
 * Layers common properties
 */
export enum CommonProperties {
  LayerID = 'layerId',
  Label = 'label',
  visible = 'visible',
}

/**
 * Type for info on layer retrieved by the getLayerInfo method.
 */
export interface LayerProperties {
  [CommonProperties.LayerID]: string;
  [CommonProperties.Label]: string;
  [CommonProperties.visible]: boolean;

  [key: string]: unknown;
}

/**
 * Parent class for layer group, helps to manipulate layer group.
 */
export class LayerGroupStore {
  readonly layerAdded: Subject<OlLayerBase>;
  protected readonly map: OlMap;
  protected layerGroup: OlLayerGroup;

  constructor(map: OlMap) {
    this.map = map;
    this.layerAdded = new Subject<OlLayerBase>();
  }

  /**
   * @returns the layer group of this instance.
   */
  getLayerGroup(): OlLayerGroup {
    return this.layerGroup;
  }

  /**
   * Remove all layers from the map and clear the layer group.
   */
  clearAll() {
    this.layerGroup
      .getLayers()
      .getArray()
      .slice()
      .forEach((layer) => this.map.removeLayer(layer));
    this.layerGroup.setLayers(new OlCollection());
  }

  /**
   * Add a single layer at the end of the layer group.
   * @param layer Ol layer.
   * @param layerId id of the layer.
   */
  addLayer(layer: OlLayerBase, layerId: string) {
    if (!this.setupAddLayer(layer, layerId)) {
      return;
    }
    this.layerGroup.getLayers().push(layer);
    this.layerAdded.next(layer);
  }

  /**
   * Retrieve a layer currently in the layer group.
   * @returns The matching layer or null.
   */
  getLayer(layerId: string): OlLayerBase | null {
    return (
      this.layerGroup
        .getLayers()
        .getArray()
        .find((layer) => layer.get(CommonProperties.LayerID) === layerId) ||
      null
    );
  }

  /**
   * @returns The attribution of all visible layers.
   */
  getAttributions(): string[] {
    return uniq(
      flatten(
        this.layerGroup
          .getLayers()
          .getArray()
          .filter((layer) => layer.getVisible())
          .map((layer) =>
            this.getAttributionFromLayer(layer as OlLayerLayer<OlSourceSource>)
          )
      )
    );
  }

  /**
   * Refresh the source of every layer with a source in the layer group.
   */
  refreshSource() {
    this.getAllSources().forEach((source) => source.refresh());
  }

  /**
   * @returns Every source from layers having sources in the layer group.
   */
  getAllSources(): OlSourceSource[] {
    return this.layerGroup
      .getLayers()
      .getArray()
      .filter((layer) => layer.get('source'))
      .map((layer) => layer.get('source'))
      .filter((source) => !isNil(source));
  }

  /**
   * Provides checks on a layer to know if the layer can be added in the map
   * and set an id for it.
   * @returns true if the layer is valid and can be added. False otherwise.
   * @protected
   */
  protected setupAddLayer(layer: OlLayerBase, layerId: string): boolean {
    if (isNil(layerId) || isNil(layer) || layerId.length === 0) {
      let error = `Unable to add layer ${layerId || '<empty>'}.`;
      if (isNil(layer)) {
        error = `${error} The layer is not defined.`;
      }
      console.error(error);
      return false;
    }
    if (this.getLayer(layerId)) {
      return false;
    }
    layer.set(CommonProperties.LayerID, layerId);
    return true;
  }

  /**
   * @param layer The layer to extract the attributions from.
   * @returns An array of attributions.
   * @private
   */
  private getAttributionFromLayer(
    layer: OlLayerLayer<OlSourceSource>
  ): string[] {
    const attributionsFn = layer.getSource()?.getAttributions();
    // Small hack to get the attribution without needed an Ol/control see
    // https://github.com/openlayers/openlayers/blob/29dcdeee5570fcfd8151768fcc9a493d8fda5164/src/ol/source/Source.js#L224-L241
    const attributions = attributionsFn
      ? attributionsFn({} as unknown as OlFrameState)
      : [];
    return Array.isArray(attributions) ? attributions : [attributions];
  }
}
