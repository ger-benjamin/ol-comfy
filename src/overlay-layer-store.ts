import OlLayerGroup from 'ol/layer/Group';
import OlMap from 'ol/Map';
import {
  CommonProperties,
  LayerGroups,
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
import { has } from 'lodash';
import { Subject } from 'rxjs';

/**
 * Feature selected event definition.
 */
export interface FeatureSelected {
  [CommonProperties.LayerID]: string;
  selected: OlFeature<OlGeometry>[];
  deselected: OlFeature<OlGeometry>[];
}

/**
 * Event definition for change in feature property
 */
export interface FeaturePropertyChanged {
  [CommonProperties.LayerID]: string;
  propertyKey: string;
}

/**
 * Storage for the state of the overlay layers in the map.
 */
export class OverlayLayerStore extends LayerGroupStore {
  readonly featuresSelected: Subject<FeatureSelected>;
  readonly featuresPropertyChanged: Subject<FeaturePropertyChanged>;

  constructor(map: OlMap) {
    super(map);
    this.layerGroup = new OlLayerGroup({
      properties: {
        [CommonProperties.LayerID]: LayerGroups.Overlay,
      },
    });
    map.addLayer(this.layerGroup);
    this.featuresSelected = new Subject<FeatureSelected>();
    this.featuresPropertyChanged = new Subject<FeaturePropertyChanged>();
  }

  /**
   * Get layer but typed as vector layer with vector source. No check, only
   * typing.
   */
  getVectorLayer(
    layerId: string
  ): OlLayerVector<OlSourceVector<OlGeometry>> | null {
    return super.getLayer(layerId) as OlLayerVector<
      OlSourceVector<OlGeometry>
    > | null;
  }

  /**
   * Get layer but typed as vector layer with cluster source. No check, only
   * typing.
   */
  getClusterLayer(layerId: string): OlLayerVector<OlSourceCluster> | null {
    return super.getLayer(layerId) as OlLayerVector<OlSourceCluster> | null;
  }

  /**
   * @returns the vector source in the corresponding layer or null. For
   *     cluster source, the returned source is the vector source inside the
   *     cluster source.
   */
  getVectorSource(layerId: string): OlSourceVector<OlGeometry> | null {
    const layer = this.getVectorLayer(layerId);
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
   * @param layerId the id of the layer to add features into.
   * @param features the features to add to the layer.
   */
  addFeatures(layerId: string, features: OlFeature<OlGeometry>[]) {
    const source = this.getVectorSource(layerId);
    if (!source || !features.length) {
      return;
    }
    // Avoid already exists errors.
    this.removeFeatures(layerId, features);
    source.addFeatures(features);
  }

  /**
   * Remove features from the target overlay layer. Does
   * nothing with empty array.
   * @param layerId the id of the layer to remove features from.
   * @param features the features to remove to the layer.
   */
  removeFeatures(layerId: string, features: OlFeature<OlGeometry>[]) {
    const source = this.getVectorSource(layerId);
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
   * @param layerId the id of the layer to remove features from.
   * @param features the features to replace existing ones in the layer.
   */
  setFeatures(layerId: string, features: OlFeature<OlGeometry>[]) {
    const source = this.getVectorSource(layerId);
    if (!source) {
      return;
    }
    source.clear();
    source.addFeatures(features);
  }

  /**
   * @param layerId the id of the layer to get the extent from.
   * @returns The extent (not empty) of all features in the target layer or
   *   null.
   */
  getLayerFeaturesExtent(layerId: string): OlExtent | null {
    const extent =
      this.getFeaturesCollection(layerId)
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
            this.getLayerFeaturesExtent(layer.get(CommonProperties.LayerID)) ??
              []
          ),
        olCreateEmptyExtent()
      );
    return extent && !olIsEmpty(extent) ? extent : null;
  }

  /**
   * @param layerId id of the layer.
   * @returns The collections of features in the layer or null. Do not use
   * collection to add/remove features. It's slow. Use related methods on the
   * source directly.
   */
  getFeaturesCollection(
    layerId: string
  ): OlCollection<OlFeature<OlGeometry>> | null {
    const source = this.getVectorSource(layerId);
    return source?.getFeaturesCollection() || null;
  }

  /**
   * Emit a select feature event.
   */
  emitSelectFeatures(
    layerId: string,
    selected: OlFeature<OlGeometry>[],
    deselected: OlFeature<OlGeometry>[]
  ) {
    this.featuresSelected.next({
      [CommonProperties.LayerID]: layerId,
      selected,
      deselected,
    });
  }

  /**
   * Set a property of every given feature with the same value.
   */
  setFeaturesProperty(
    layerId: string,
    features: OlFeature<OlGeometry>[],
    key: string,
    value: unknown
  ) {
    features.forEach((feature) => {
      feature.set(key, value, true);
    });
    this.getLayer(layerId)?.changed();
    this.featuresPropertyChanged.next({
      [CommonProperties.LayerID]: layerId,
      propertyKey: key,
    });
  }

  /**
   * @param layerId id of the layer
   * @returns The cluster features in the layer or null
   * Do not modify or save cluster features as they are recreated dynamically
   * on each map rendering (move, zoom, etc). It's not possible to rely on
   *     this object.
   */
  getClusterFeatures(layerId: string): OlFeature<OlGeometry>[] | null {
    const layer = this.getClusterLayer(layerId);
    if (layer === null) {
      return null;
    }
    return layer.getSource().getFeatures();
  }
}
