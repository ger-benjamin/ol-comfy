import OlMap from 'ol/Map';
import { BackgroundLayerStore } from '../layer/background-layer-store';
import { OverlayLayerStore } from '../layer/overlay-layer-store';
import { OverlayStore } from '../overlay/overlay-store';
import { ViewStore } from '../view/view-store';
import { uniq } from 'lodash';
import OlControl from 'ol/control/Control';

export const ControlId = 'controlId';

/**
 * Storage for the state of the map.
 * Allows setting values and get instances from the map and sub-elements (view,
 * layers, etc.)
 */
export class MapStore {
  private readonly map: OlMap;
  private readonly viewStore: ViewStore;
  private readonly backgroundLayerStore: BackgroundLayerStore;
  private readonly overlayLayerStore: OverlayLayerStore;
  private readonly overlayStore: OverlayStore;

  /**
   * Create and set up the map.
   */
  constructor() {
    this.map = new OlMap({
      controls: [],
      layers: [],
    });
    this.viewStore = new ViewStore(this.map);
    this.backgroundLayerStore = new BackgroundLayerStore(this.map);
    this.overlayLayerStore = new OverlayLayerStore(this.map);
    this.overlayStore = new OverlayStore(this.map);
  }

  /**
   * @returns the map.
   */
  getMap(): OlMap {
    return this.map;
  }

  /**
   * @returns the view store
   */
  getViewStore(): ViewStore {
    return this.viewStore;
  }

  /**
   * @returns the background layer store
   */
  getBackgroundLayerStore(): BackgroundLayerStore {
    return this.backgroundLayerStore;
  }

  /**
   * @returns the overlay layer store
   */
  getOverlayLayerStore(): OverlayLayerStore {
    return this.overlayLayerStore;
  }

  /**
   * @returns the overlay (popup) store
   */
  getOverlayStore(): OverlayStore {
    return this.overlayStore;
  }

  /**
   * Return attributions of every visible layers;
   */
  getAttributions(): string[] {
    return uniq([
      ...this.overlayLayerStore.getAttributions(),
      ...this.backgroundLayerStore.getAttributions(),
    ]);
  }

  /**
   * Based on the control id, check whether the control is already on the map.
   */
  hasControl(controlId: string): boolean {
    return !!this.map
      .getControls()
      .getArray()
      .find((control) => control.get(ControlId) === controlId);
  }

  /**
   * Add an identified control into the map.
   * @param controlId the (uniq) id of the controller. If it already
   * exists, the control will not be added.
   * @param control the control to add.
   */
  addControl(controlId: string, control: OlControl) {
    if (this.hasControl(controlId)) {
      return;
    }
    control.set(ControlId, controlId);
    this.map.addControl(control);
  }
}
