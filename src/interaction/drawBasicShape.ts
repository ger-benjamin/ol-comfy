import OlInteractionDraw, { type Options } from 'ol/interaction/Draw.js';
import OlMap from 'ol/Map.js';
import OlSourceVector from 'ol/source/Vector.js';
import { never } from 'ol/events/condition.js';
import { Draw } from './draw.js';
import type OlFeature from 'ol/Feature.js';

/**
 * Manage "shape" drawing interaction on an OpenLayers map.
 */
export class DrawBasicShape extends Draw {
  constructor(map: OlMap, options: Options, uid: string) {
    super(map, uid);
    if (!this.interaction) {
      this.createInteraction(uid, options);
    }
  }

  /**
   * Instantiate a new draw interaction.
   * @private
   */
  private createInteraction(uid: string, options: Options) {
    this.interaction = new OlInteractionDraw(options);
    this.registerInteraction(this.interaction, uid);
  }

  /**
   * Get defaults configured Drawing options to draw polygons.
   * @static
   */
  static getDefaultPolygonOptions(source: OlSourceVector<OlFeature>): Options {
    return {
      freehandCondition: never,
      source,
      type: 'Polygon',
    };
  }

  /**
   * Get defaults configured Drawing options to draw circles.
   * @static
   */
  static getDefaultCircleOptions(source: OlSourceVector<OlFeature>): Options {
    return {
      source,
      type: 'Circle',
    };
  }

  /**
   * Get defaults configured Drawing options to draw lines.
   * @static
   */
  static getDefaultLineOptions(source: OlSourceVector<OlFeature>): Options {
    return {
      freehandCondition: never,
      source,
      type: 'LineString',
    };
  }

  /**
   * Get defaults configured Drawing options to draw points.
   * @static
   */
  static getDefaultPointOptions(source: OlSourceVector<OlFeature>): Options {
    return {
      source,
      type: 'Point',
    };
  }
}
