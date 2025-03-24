import OlInteractionTranslate, {
  type Options as TranslateOptions,
} from 'ol/interaction/Translate.js';
import OlMap from 'ol/Map.js';

/**
 * Base class to manage OL Translate interactions.
 */
export class Translate {
  private readonly translateInteraction: OlInteractionTranslate;

  /**
   * Add a new Translate Interaction in the map.
   */
  constructor(
    private map: OlMap,
    options: TranslateOptions,
  ) {
    this.translateInteraction = new OlInteractionTranslate(options);
    this.map.addInteraction(this.translateInteraction);
  }

  /**
   * Removes the interaction from the map.
   */
  destroy() {
    this.map.removeInteraction(this.translateInteraction);
  }

  /**
   * @returns the interactions.
   */
  getInteraction(): OlInteractionTranslate {
    return this.translateInteraction;
  }
}
