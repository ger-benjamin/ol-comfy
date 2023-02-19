import { isNil } from 'lodash';
import OlMap from 'ol/Map';
import OlStyle from 'ol/style/Style';
import { Subject } from 'rxjs';

/** Single instance of an ol empty style */
export const EmptyStyle = new OlStyle();

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
 * @returns An observable stored in the map and created by Ol-Comfy.
 */
export const getObservable = (
  map: OlMap,
  observableUid: string
): Subject<unknown> | undefined => {
  return map.get(observableUid);
};
