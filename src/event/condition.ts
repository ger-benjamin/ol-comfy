import { MapBrowserEvent } from 'ol';
import { ListenKey } from './listen-key';
import { click } from 'ol/events/condition';

type conditionFn = (mapBrowserEvent: MapBrowserEvent<UIEvent>) => boolean;
type callBackFn = (mapBrowserEvent: MapBrowserEvent<UIEvent>) => void;

/**
 * @returns a condition function that check if the event is a click event
 * and if the listened key is currently pressed.
 * @param listenKey The instance used to know if the key is currently pressed.
 * @param callback An optional callback to execute if the condition is
 * fulfilled.
 */
export const getClickPlusKeyCondition = (
  listenKey: ListenKey,
  callback?: callBackFn
): conditionFn => {
  return (mapBrowserEvent: MapBrowserEvent<UIEvent>): boolean => {
    if (!click(mapBrowserEvent) || !listenKey.isKeyDown()) {
      return false;
    }
    if (callback) {
      callback(mapBrowserEvent);
    }
    return true;
  };
};
