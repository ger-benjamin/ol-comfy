import OlInteractionModify, {
  type Options as ModifyOptions,
} from 'ol/interaction/Modify.js';
import OlMap from 'ol/Map.js';

/**
 * Base class to manage OL Modify interactions.
 */
export class Modify {
  private readonly modifyInteraction: OlInteractionModify;

  /**
   * Add a new Modify Interaction in the map.
   */
  constructor(
    private map: OlMap,
    options: ModifyOptions,
  ) {
    this.modifyInteraction = new OlInteractionModify(options);
    this.map.addInteraction(this.modifyInteraction);
  }

  /**
   * Removes the interaction from the map.
   */
  destroy() {
    this.map.removeInteraction(this.modifyInteraction);
  }

  /**
   * @returns the interactions.
   */
  getInteraction(): OlInteractionModify {
    return this.modifyInteraction;
  }
}
