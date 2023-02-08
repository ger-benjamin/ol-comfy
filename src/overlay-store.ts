import OlMap from 'ol/Map';
import OlOverlay from 'ol/Overlay';

export const OverlayGroupId = 'overlayGroupId';

/**
 * Storage for overlays (popups) on the map.
 */
export class OverlayStore {
  constructor(private readonly map: OlMap) {}

  /**
   * Add an overlay (with a group id) to the map.
   */
  addOverlay(overlayGroupId: string, overlay: OlOverlay) {
    overlay.set(OverlayGroupId, overlayGroupId);
    this.map.addOverlay(overlay);
  }

  /**
   * @returns all overlay for a specific group.
   */
  getOverlays(overlayGroupId: string) {
    return this.map
      .getOverlays()
      .getArray()
      .filter((overlay) => overlay.get(OverlayGroupId) === overlayGroupId);
  }

  /**
   * Clear from the map all existing overlays from a group.
   */
  clearOverlaysByGroupId(overlayGroupId: string) {
    this.map
      .getOverlays()
      .getArray()
      .filter(
        (overlay: OlOverlay) => overlay.get(OverlayGroupId) === overlayGroupId
      )
      .forEach((overlay: OlOverlay) => this.map.removeOverlay(overlay));
  }

  /**
   * Set z-index of an overlay.
   * @static
   */
  static setOverlayZindex(overlay: OlOverlay, zIndex: number) {
    const element = overlay.getElement()?.parentElement;
    if (element) {
      element.style.zIndex = `${zIndex}`;
    }
  }
}
