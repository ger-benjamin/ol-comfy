import OlInteractionDraw, { Options } from 'ol/interaction/Draw';
import { Draw } from './draw';
import OlMap from 'ol/Map';
import OlSourceVector from 'ol/source/Vector';
import OlGeometry from 'ol/geom/Geometry';
import { never } from 'ol/events/condition';

/**
 * Manage "area" drawing interaction on an OpenLayers map.
 * For Polygon and Circle.
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
  static getDefaultPolygonOptions(source: OlSourceVector<OlGeometry>): Options {
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
  static getDefaultCircleOptions(source: OlSourceVector<OlGeometry>): Options {
    return {
      source,
      type: 'Circle',
    };
  }

  /**
   * Get defaults configured Drawing options to draw circles.
   * @static
   */
  static getDefaultLineOptions(source: OlSourceVector<OlGeometry>): Options {
    return {
      freehandCondition: never,
      source,
      type: 'LineString',
    };
  }

  /**
   * Get defaults configured Drawing options to draw circles.
   * @static
   */
  static getDefaultPointOptions(source: OlSourceVector<OlGeometry>): Options {
    return {
      source,
      type: 'Point',
    };
  }
}
