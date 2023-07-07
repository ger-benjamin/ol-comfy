import { MapBrowserEvent } from 'ol';

type conditionFn = (mapBrowserEvent: MapBrowserEvent<UIEvent>) => boolean;
type callBackFn = (mapBrowserEvent: MapBrowserEvent<UIEvent>) => void;

/**
 * Handy function that can be used as condition without using the condition signature.
 * @param testFn The function to execute as a condition (without params).
 * @returns an Ol condition function.
 */
export const condition = (testFn: () => boolean): conditionFn => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_mapBrowserEvent: MapBrowserEvent<UIEvent>): boolean => {
    return testFn();
  };
};

/**
 * @param condition The condition to test.
 * @param callback A callback to execute if the condition is fulfilled.
 * @returns a condition function that check the given condition. If the condition is truthy, execute the callback.
 */
export const conditionThen = (
  condition: conditionFn,
  callback: callBackFn
): conditionFn => {
  return (mapBrowserEvent: MapBrowserEvent<UIEvent>) => {
    if (condition(mapBrowserEvent)) {
      callback(mapBrowserEvent);
      return true;
    }
    return false;
  };
};
