import { EventsKey, listen } from 'ol/events';
import { unByKeyAll } from '../ol-utils';
import BaseEvent from 'ol/events/Event';

/**
 * Listen keydown/keyup event on document for a specific keyboard key.
 */
export class ListenKey {
  private readonly eventKeys: EventsKey[] = [];
  private keyDown = false;

  /**
   * @param listenedKey the key to listen.
   */
  constructor(private readonly listenedKey: string) {
    this.eventKeys.push(
      listen(document, 'keydown', this.handleKeyDown.bind(this))
    );
    this.eventKeys.push(listen(document, 'keyup', this.handleKeyUp.bind(this)));
  }

  /**
   * Is the key currently pressed.
   */
  isKeyDown(): boolean {
    return this.keyDown;
  }

  /**
   * Destroy listeners. The instance is then useless.
   */
  destroy() {
    unByKeyAll(this.eventKeys);
  }

  /**
   * Check if the key is pressed.
   * @private
   */
  private handleKeyDown(evt: Event | BaseEvent) {
    if (evt instanceof KeyboardEvent && evt.key === this.listenedKey) {
      this.keyDown = true;
    }
  }

  /**
   * Check if the key is released.
   * @private
   */
  private handleKeyUp(evt: Event | BaseEvent) {
    if (evt instanceof KeyboardEvent && evt.key === this.listenedKey) {
      this.keyDown = false;
    }
  }
}
