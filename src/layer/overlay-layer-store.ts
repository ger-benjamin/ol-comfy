import OlMap from 'ol/Map';
import {
  CommonProperties,
  LayerGroupOptions,
  LayerGroupStore,
} from './layer-group-store';
import {
  createEmpty as olCreateEmptyExtent,
  extend as olExtend,
  Extent as OlExtent,
  isEmpty as olIsEmpty,
} from 'ol/extent';
import OlFeature from 'ol/Feature';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import { Geometry as OlGeometry } from 'ol/geom';
import OlCollection from 'ol/Collection';
import OlSourceCluster from 'ol/source/Cluster';
import { has, isNil } from 'lodash';
import { Subject } from 'rxjs';
import { getObservable } from '../map/utils';

export const DefaultOverlayLayerGroupName = 'olcOverlayLayerGroup';

/**
 * Feature selected event definition.
 */
export interface FeatureSelected {
  [CommonProperties.LayerUid]: string;
  selected: OlFeature<OlGeometry>[];
  deselected: OlFeature<OlGeometry>[];
}

/**
 * Event definition for change in feature property
 */
export interface FeaturePropertyChanged {
  [CommonProperties.LayerUid]: string;
  propertyKey: string;
}

/**
 * Manage overlay layers in the map.
 * Each instance must have a unique name (one cas use the default name).
 * Default position is 20.
 */
export class OverlayLayerStore extends LayerGroupStore {
  private readonly featureSelectedId = 'olcOverlayLayerFeatureSelected';
  private readonly featuresPropertyChangedId =
    'olcOverlayLayerFeaturePropertyChanged';

  constructor(map: OlMap, options: LayerGroupOptions = {}) {
    const layerGroupUid =
      options[CommonProperties.LayerUid] || DefaultOverlayLayerGroupName;
    super(map, layerGroupUid);
    const position = isNil(options.position) ? 20 : options.position;
    this.addLayerGroup(layerGroupUid, position);
    this.addOverlayLayerObservables();
  }

  /**
   * Add feature selected observable on this group. To call manually on
   * feature selection.
   * See emitSelectFeatures.
   */
  get featuresSelected(): Subject<FeatureSelected> {
    return getObservable(
      this.map,
      this.getObservableName(this.featureSelectedId)
    ) as Subject<FeatureSelected>;
  }

  /**
   * Add feature property changed observable on this group.
   * See setFeaturesProperty.
   */
  get featuresPropertyChanged(): Subject<FeaturePropertyChanged> {
    return getObservable(
      this.map,
      this.getObservableName(this.featuresPropertyChangedId)
    ) as Subject<FeaturePropertyChanged>;
  }

  /**
   * Get layer but typed as vector layer with vector source. No check, only
   * typing.
   */
  getVectorLayer(
    layerUid: string
  ): OlLayerVector<OlSourceVector<OlGeometry>> | null {
    return super.getLayer(layerUid) as OlLayerVector<
      OlSourceVector<OlGeometry>
    > | null;
  }

  /**
   * Get layer but typed as vector layer with cluster source. No check, only
   * typing.
   */
  getClusterLayer(layerUid: string): OlLayerVector<OlSourceCluster> | null {
    return super.getLayer(layerUid) as OlLayerVector<OlSourceCluster> | null;
  }

  /**
   * @returns the vector source in the corresponding layer or null. For
   *     cluster source, the returned source is the vector source inside the
   *     cluster source.
   */
  getVectorSource(layerUid: string): OlSourceVector<OlGeometry> | null {
    const layer = this.getVectorLayer(layerUid);
    if (layer === null) {
      return null;
    }
    const source = layer.getSource();
    // Returns the vector source from cluster source if it exists. And from
    // the vector source directly otherwise.
    if (has(source, 'source')) {
      return (source as OlSourceCluster).getSource();
    }
    return source;
  }

  /**
   * Add features in the target overlay layer. Does
   * nothing with empty array.
   * @param layerUid the id of the layer to add features into.
   * @param features the features to add to the layer.
   */
  addFeatures(layerUid: string, features: OlFeature<OlGeometry>[]) {
    const source = this.getVectorSource(layerUid);
    if (!source || !features.length) {
      return;
    }
    // Avoid already exists errors.
    this.removeFeatures(layerUid, features);
    source.addFeatures(features);
  }

  /**
   * Remove features from the target overlay layer. Does
   * nothing with empty array.
   * @param layerUid the id of the layer to remove features from.
   * @param features the features to remove to the layer.
   */
  removeFeatures(layerUid: string, features: OlFeature<OlGeometry>[]) {
    const source = this.getVectorSource(layerUid);
    if (!source || !features.length) {
      return;
    }
    features.forEach((feature) => {
      if (source.hasFeature(feature)) {
        source.removeFeature(feature);
      }
    });
  }

  /**
   * Set features in the target overlay layer.
   * @param layerUid the id of the layer to remove features from.
   * @param features the features to replace existing ones in the layer.
   */
  setFeatures(layerUid: string, features: OlFeature<OlGeometry>[]) {
    const source = this.getVectorSource(layerUid);
    if (!source) {
      return;
    }
    source.clear();
    source.addFeatures(features);
  }

  /**
   * @param layerUid the id of the layer to get the extent from.
   * @returns The extent (not empty) of all features in the target layer or
   *   null.
   */
  getLayerFeaturesExtent(layerUid: string): OlExtent | null {
    const extent =
      this.getFeaturesCollection(layerUid)
        ?.getArray()
        .reduce(
          (currentExtent, feature) =>
            olExtend(currentExtent, feature.getGeometry()?.getExtent() ?? []),
          olCreateEmptyExtent()
        ) ?? null;
    return extent && !olIsEmpty(extent) ? extent : null;
  }

  /**
   * @returns The extent (not empty) of all features in every overlay in the
   * map.
   */
  getFeaturesExtent(): OlExtent | null {
    const extent = this.layerGroup
      .getLayers()
      .getArray()
      .reduce(
        (currentExtent, layer) =>
          olExtend(
            currentExtent,
            this.getLayerFeaturesExtent(layer.get(CommonProperties.LayerUid)) ??
              []
          ),
        olCreateEmptyExtent()
      );
    return extent && !olIsEmpty(extent) ? extent : null;
  }

  /**
   * @param layerUid id of the layer.
   * @returns The collections of features in the layer or null. Do not use
   * collection to add/remove features. It's slow. Use related methods on the
   * source directly.
   */
  getFeaturesCollection(
    layerUid: string
  ): OlCollection<OlFeature<OlGeometry>> | null {
    const source = this.getVectorSource(layerUid);
    return source?.getFeaturesCollection() || null;
  }

  /**
   * Emit a select feature event.
   */
  emitSelectFeatures(
    layerUid: string,
    selected: OlFeature<OlGeometry>[],
    deselected: OlFeature<OlGeometry>[]
  ) {
    this.featuresSelected.next({
      [CommonProperties.LayerUid]: layerUid,
      selected,
      deselected,
    });
  }

  /**
   * Set a property of every given feature with the same value.
   */
  setFeaturesProperty(
    layerUid: string,
    features: OlFeature<OlGeometry>[],
    key: string,
    value: unknown
  ) {
    features.forEach((feature) => {
      feature.set(key, value, true);
    });
    this.getLayer(layerUid)?.changed();
    this.featuresPropertyChanged.next({
      [CommonProperties.LayerUid]: layerUid,
      propertyKey: key,
    });
  }

  /**
   * @param layerUid id of the layer
   * @returns The cluster features in the layer or null
   * Do not modify or save cluster features as they are recreated dynamically
   * on each map rendering (move, zoom, etc). It's not possible to rely on
   *     this object.
   */
  getClusterFeatures(layerUid: string): OlFeature<OlGeometry>[] | null {
    const layer = this.getClusterLayer(layerUid);
    if (layer === null) {
      return null;
    }
    return layer.getSource().getFeatures();
  }

  /**
   * Add overlay layer observables to the map if it doesn't already exist.
   * These instances of observables will be never set or removed.
   * @private
   */
  private addOverlayLayerObservables() {
    if (
      getObservable(this.map, this.getObservableName(this.featureSelectedId))
    ) {
      return;
    }
    this.map.set(
      this.getObservableName(this.featureSelectedId),
      new Subject<FeatureSelected>()
    );
    this.map.set(
      this.getObservableName(this.featuresPropertyChangedId),
      new Subject<FeaturePropertyChanged>()
    );
  }
}
