import OlInteractionSnap, { Options as SnapOptions } from 'ol/interaction/Snap';
import OlMap from 'ol/Map';

/**
 * Base class to manage OL Snap interactions.
 */
export class Snap {
  private readonly snapInteraction: OlInteractionSnap;

  /**
   * Add a new Modify Interaction in the map.
   */
  constructor(
    private map: OlMap,
    options: SnapOptions,
  ) {
    this.snapInteraction = new OlInteractionSnap(options);
    this.map.addInteraction(this.snapInteraction);
  }

  /**
   * Removes the interaction from the map.
   */
  destroy() {
    this.map.removeInteraction(this.snapInteraction);
  }

  /**
   * @returns the interactions.
   */
  getInteraction(): OlInteractionSnap {
    return this.snapInteraction;
  }
}
