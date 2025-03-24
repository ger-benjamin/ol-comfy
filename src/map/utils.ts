import { isNil } from 'lodash';
import { Subject } from 'rxjs';
import OlMap from 'ol/Map.js';
import OlStyle from 'ol/style/Style.js';

/** Single instance of an ol empty style */
export const EmptyStyle = new OlStyle();

/**
 * @returns A projection distance from an amount of pixels (from [0, 0] ->
 * could be imprecise);
 */
export const getDistanceFromAmountOfPixel = (
  map: OlMap,
  amountOfPixel: number,
): number => {
  const coord1 = map.getCoordinateFromPixel([0, 0]);
  if (isNil(coord1)) {
    return 0;
  }
  const coord2 = map.getCoordinateFromPixel([amountOfPixel, 0]);
  if (coord1[0] === undefined || coord2[0] === undefined) {
    return 0;
  }
  return Math.abs(coord1[0] - coord2[0]);
};

/**
 * @returns An observable stored in the map and created by Ol-Comfy.
 */
export const getObservable = (
  map: OlMap,
  observableUid: string,
): Subject<unknown> | undefined => {
  return map.get(observableUid);
};
