import { type EventsKey } from 'ol/events.js';
import { unByKey } from 'ol/Observable.js';

/**
 * Unsubscribe to all OpenLayer listeners.
 */
export const unByKeyAll = (eventKeys: EventsKey[]) => {
  eventKeys.forEach((eventKey) => unByKey(eventKey));
};
