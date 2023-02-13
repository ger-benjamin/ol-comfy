import { isNil } from 'lodash';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import OlBaseObject from 'ol/Object';
import OlMap from 'ol/Map';

/**
 * Unsubscribe to all OpenLayer observables.
 */
export const unByKeyAll = (eventKeys: EventsKey[]) => {
  eventKeys.forEach((eventKey) => unByKey(eventKey));
};

/**
 * @returns A projection distance from an amount of pixels (from [0, 0] ->
 * could be imprecise);
 */
export const getDistanceFromAmountOfPixel = (
  map: OlMap,
  amountOfPixel: number
): number => {
  if (isNil(map.getCoordinateFromPixel([0, 0]))) {
    return 0;
  }
  return Math.abs(
    map.getCoordinateFromPixel([0, 0])[0] -
      map.getCoordinateFromPixel([amountOfPixel, 0])[0]
  );
};

/**
 * Get an OpenLayers object and return it sorted by the given key property.
 */
export const getSortedOlObjectsByProperty = <T extends OlBaseObject>(
  objects: T[],
  propertyKey: string
): T[] => {
  return objects.slice().sort((object1, object2) => {
    const prop1 = object1.get(propertyKey) || '';
    const prop2 = object2.get(propertyKey);
    if (prop1 === prop2) {
      return 0;
    }
    return prop1 > prop2 ? 1 : -1;
  });
};
