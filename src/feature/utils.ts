import { uniq } from 'lodash';
import OlFeature from 'ol/Feature';
import { Geometry as OlGeometry } from 'ol/geom';
import OlGeomPoint from 'ol/geom/Point';
import OlGeomLine from 'ol/geom/LineString';
import OlGeomPolygon from 'ol/geom/Polygon';
import OlGeomCircle from 'ol/geom/Circle';
import {
  createEmpty as olCreateEmptyExtent,
  extend as olExtend,
  Extent as OlExtent,
  isEmpty as olIsEmpty,
} from 'ol/extent';

/**
 * @param features the features to get the properties values from.
 * @param propertyKey the property key to get the value in the features.
 * @returns Distinct values of features for a given property's key.
 */
export const getDistinctFeaturesProperties = (
  features: OlFeature<OlGeometry>[],
  propertyKey: string
): unknown[] => {
  return uniq(
    features.map((feature) => {
      return feature.get(propertyKey);
    })
  );
};

/**
 * From points, create lines (0->1, 1->2, 2->3, etc.)
 * @param points points To create the line with.
 * @param opt_onLineCreated Optional function to apply effect on each created
 * line.
 * @returns created lines from given points (0->1, 1->2, 2->3, etc.)
 */
export const getLinesBetweenPoints = (
  points: OlFeature<OlGeomPoint>[],
  opt_onLineCreated?: (
    line: OlFeature<OlGeomLine>,
    startPoint: OlFeature<OlGeomPoint>,
    endPoint: OlFeature<OlGeomPoint>
  ) => void
): OlFeature<OlGeomLine>[] => {
  const pointsShifted = Array.from(points.slice(1));
  return pointsShifted.map((_point, index) => {
    const line = new OlFeature<OlGeomLine>({
      geometry: new OlGeomLine([
        points[index].getGeometry()?.getCoordinates() || [],
        pointsShifted[index].getGeometry()?.getCoordinates() || [],
      ]),
    });
    if (opt_onLineCreated) {
      opt_onLineCreated(line, points[index], pointsShifted[index]);
    }
    return line;
  });
};

/**
 * @returns OlGeomPoint at the center of the given "area" geometry (circle
 * or polygon).
 */
export const getCenterOfArea = (
  geometry: OlGeomPolygon | OlGeomCircle
): OlGeomPoint => {
  if (geometry instanceof OlGeomPolygon) {
    return geometry.getInteriorPoint();
  }
  return new OlGeomPoint(geometry.getCenter());
};

/**
 * @returns The extent (not empty) of all given features.
 */
export const getFeaturesExtent = (
  features: OlFeature<OlGeometry>[]
): OlExtent | null => {
  const extent =
    features.reduce(
      (currentExtent, feature) =>
        olExtend(currentExtent, feature.getGeometry()?.getExtent() ?? []),
      olCreateEmptyExtent()
    ) ?? null;
  return extent && !olIsEmpty(extent) ? extent : null;
};
