import OlMap from 'ol/Map';
import OlCollection from 'ol/Collection';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerBase from 'ol/layer/Base';
import { flatten, isNil, uniq } from 'lodash';
import OlLayerLayer from 'ol/layer/Layer';
import OlSourceSource from 'ol/source/Source';
import { FrameState as OlFrameState } from 'ol/PluggableMap';
import { Subject } from 'rxjs';
import { insertAtKeepOrder } from '../collection';
import { getObservable } from '../map/utils';

/**
 * Layers common properties
 */
export enum CommonProperties {
  LayerUid = 'olcLayerUid',
  Label = 'olcLabel',
  visible = 'olcVisible',
}

/**
 * Options to create layer group.
 */
export interface LayerGroupOptions {
  /**
   * Position of the layer group in the map layer array. This position is
   * fixed.
   */
  position?: number;
  /** Unique ID for the layer group. */
  [CommonProperties.LayerUid]?: string;
}

/**
 * Parent (abstract) class for layer group, helps to manipulate one layer group.
 * The child class must start by setting the layerGroup.
 */
export class LayerGroup {
  private readonly layerAddedId = 'olcLayerAdded';
  protected readonly map: OlMap;
  protected layerGroup: OlLayerGroup;

  constructor(map: OlMap, layerGroupUid: string) {
    this.map = map;
    this.addObservables(layerGroupUid);
  }

  /**
   * @returns an observables that notify addition of layer in this group.
   */
  get layerAdded(): Subject<OlLayerBase> {
    return getObservable(
      this.map,
      this.getObservableName(this.layerAddedId)
    ) as Subject<OlLayerBase>;
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
   * @param layerUid id of the layer.
   */
  addLayer(layer: OlLayerBase, layerUid: string) {
    if (!this.setupAddLayer(layer, layerUid)) {
      return;
    }
    this.layerGroup.getLayers().push(layer);
    this.layerAdded.next(layer);
  }

  /**
   * Retrieve a layer currently in the layer group.
   * @returns The matching layer or null.
   */
  getLayer(layerUid: string): OlLayerBase | null {
    return (
      this.layerGroup
        .getLayers()
        .getArray()
        .find((layer) => layer.get(CommonProperties.LayerUid) === layerUid) ||
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
  protected setupAddLayer(layer: OlLayerBase, layerUid: string): boolean {
    if (isNil(layerUid) || isNil(layer) || layerUid.length === 0) {
      let error = `Unable to add layer ${layerUid || '<empty>'}.`;
      if (isNil(layer)) {
        error = `${error} The layer is not defined.`;
      }
      console.error(error);
      return false;
    }
    if (this.getLayer(layerUid)) {
      return false;
    }
    layer.set(CommonProperties.LayerUid, layerUid);
    return true;
  }

  /**
   * Add a layer group to a specified position in the array of map's
   * layers.
   * @protected
   */
  protected addLayerGroup(layerGroupUid: string, position: number) {
    const layerGroup = this.findLayerGroup(layerGroupUid);
    if (layerGroup) {
      this.layerGroup = layerGroup;
      return;
    }
    this.layerGroup = new OlLayerGroup({
      properties: {
        [CommonProperties.LayerUid]: layerGroupUid,
      },
    });
    insertAtKeepOrder(
      this.map.getLayers(),
      this.layerGroup,
      `olcPosition-${layerGroupUid}`,
      position
    );
  }

  /**
   * Retrieve a layer group based on its unique id.
   */
  protected findLayerGroup(layerUid: string): OlLayerGroup | null {
    return (
      (this.map
        .getLayers()
        .getArray()
        .find(
          (layerGroup) =>
            layerGroup.get(CommonProperties.LayerUid) === layerUid &&
            layerGroup instanceof OlLayerGroup
        ) as OlLayerGroup) || null
    );
  }

  /**
   * @returns A unique observable name.
   * @protected
   */
  protected getObservableName(observableName: string) {
    const layerGroupUid = this.layerGroup.get(CommonProperties.LayerUid);
    return this.getObservableNameFromLayerUid(observableName, layerGroupUid);
  }

  /**
   * @returns A unique observable name.
   * @private
   */
  private getObservableNameFromLayerUid(
    observableName: string,
    layerGroupUid: string
  ) {
    return `${observableName}-${layerGroupUid}`;
  }

  /**
   * Add layer group observables to the map if it doesn't already exist.
   * These instances of observables will be never set or removed.
   * @private
   */
  private addObservables(layerGroupUid: string) {
    const observableName = this.getObservableNameFromLayerUid(
      this.layerAddedId,
      layerGroupUid
    );
    if (getObservable(this.map, observableName)) {
      return;
    }
    this.map.set(observableName, new Subject<OlLayerBase>());
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
