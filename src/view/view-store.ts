import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { Extent as OlExtent } from 'ol/extent';
import { isNil } from 'lodash';
import { getPointResolution } from 'ol/proj';
import { OPENLAYERS_ANIMATION_DELAY } from '../const-from-outside';

/**
 * Storage for the state of the view in the map.
 */
export class ViewStore {
  private readonly map: OlMap;
  private view: OlView;

  constructor(map: OlMap) {
    this.map = map;
    this.view = this.map.getView();
  }

  /**
   * @returns the map's view.
   */
  getView(): OlView {
    return this.view;
  }

  /**
   * Set the map's view.
   */
  setMapView(olView: OlView) {
    this.map.setView(olView);
    this.view = this.map.getView();
  }

  /**
   * @returns The point resolution at a coordinate of the map.
   */
  getPointResolution(coordinates: number[]): number | undefined {
    const resolution = this.view.getResolution();
    if (isNil(resolution)) {
      return undefined;
    }
    return getPointResolution(
      this.view.getProjection(),
      resolution,
      coordinates
    );
  }

  /**
   * Set the view to the new nearest extent.
   * @param extent The new extent of the map.
   * @param padding The padding (in pixels) to add around this extent.
   */
  fit(extent: OlExtent, padding: number) {
    const boxPadding = [0, 0, 0, 0].fill(padding);
    this.view.fit(extent, { nearest: true, padding: boxPadding });
  }

  /**
   * Zoom in or zoom out to the nearest resolution using a small animation.
   * @param delta number of resolution step to zoom in (positive value) or
   *     zoom out (negative value);
   */
  zoom(delta: number) {
    const currentZoom = this.view.getZoom();
    if (isNil(currentZoom)) {
      return;
    }
    const newZoom = this.view.getConstrainedZoom(currentZoom + delta);
    if (isNil(newZoom)) {
      return;
    }
    if (this.view.getAnimating()) {
      this.view.cancelAnimations();
    }
    this.view.animate({
      zoom: newZoom,
      duration: OPENLAYERS_ANIMATION_DELAY,
    });
  }
}
