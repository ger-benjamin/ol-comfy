import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';

/**
 * Unsubscribe to all OpenLayer observables.
 */
export const unByKeyAll = (eventKeys: EventsKey[]) => {
  eventKeys.forEach((eventKey) => unByKey(eventKey));
};
