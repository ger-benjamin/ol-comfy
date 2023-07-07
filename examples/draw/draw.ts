import { Map } from '../../src/map/map';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import OlCollection from 'ol/Collection';
import OlFeature from 'ol/Feature';
import { OSM } from 'ol/source';
import OlGeometry from 'ol/geom/Geometry';
import RenderFeature from 'ol/render/Feature';
import OlStyle from 'ol/style/Style';
import { condition, conditionThen } from '../../src/event/condition';
import { ListenKey } from '../../src/event/listen-key';
import { updateLayerStyle } from '../../src/layer/utils';
import { DrawBasicShape } from '../../src/interaction/drawBasicShape';
import { Modify } from '../../src/interaction/modify';
import { Translate } from '../../src/interaction/translate';
import { Snap } from '../../src/interaction/snap';
import { MapBrowserEvent } from 'ol';
import { EventsKey } from 'ol/events';
import { BackgroundLayerGroup, EmptyStyle, OverlayLayerGroup } from '../../src';
import OlCircle from 'ol/style/Circle';
import OlFill from 'ol/style/Fill';
import OlStroke from 'ol/style/Stroke';
import { unByKeyAll } from '../../src/event/utils';
import OlGeomPoint from 'ol/geom/Point';
import OlGeomLine from 'ol/geom/LineString';
import { platformModifierKeyOnly, click } from 'ol/events/condition';
import { overEvery } from 'lodash';

// Globally accessible values you need:
const map = Map.createEmptyMap();
const layer1Id = 'layer1-id';
const backgroundLayer1Id = 'background1-id';
const pointInteractionId = 'point-interaction-uid';
const lineInteractionId = 'line-interaction-uid';

// Setup example.
const layer1 = new OlLayerVector({
  source: new OlSourceVector({
    features: new OlCollection([new OlFeature()]),
  }),
});
const backgroundLayer1 = new OlLayerTile({
  source: new OSM(),
});
const print = (msg) => {
  document.querySelector('#console .text').textContent = msg;
};

// Your controller initializing the map.
map.setView(
  new OlView({
    center: [0, 0],
    zoom: 2,
  })
);
map.setTarget('map');

// Below: Use ol-comfy.
// Your controller initializing the layers.
let overlayLayerGroup = new OverlayLayerGroup(map);
overlayLayerGroup.addLayer(layer1, layer1Id);
const backgroundLayerGroup = new BackgroundLayerGroup(map);
backgroundLayerGroup.addLayer(backgroundLayer1, backgroundLayer1Id);

// A component wanting to enable draw.
let drawPoint: DrawBasicShape | undefined;
let drawLine: DrawBasicShape | undefined;
let modify: Modify | undefined;
let snap: Snap | undefined;
let translate: Translate | undefined;
let listenKey: ListenKey | undefined;
const eventKeys: EventsKey[] = [];

/**
 * Create and configure map interaction to draw.
 * That's a full example with draw, modification, translation, deletion with
 * custom condition and custom styling.
 */
const setupDrawing = () => {
  // Setup the layer to draw in.
  overlayLayerGroup = new OverlayLayerGroup(map);
  const drawLayer = overlayLayerGroup?.getLayer(layer1Id) as
    | OlLayerVector<OlSourceVector<OlGeometry>>
    | undefined;
  const source = drawLayer?.getSource();
  if (!drawLayer || !source || !map) {
    console.error('No layer source or no map to draw in.');
    return;
  }
  updateLayerStyle(drawLayer, createStyle);
  // Setup listen "delete" key;
  listenKey = new ListenKey('Delete');
  // Setup drawing.
  const pointOptions = DrawBasicShape.getDefaultPointOptions(source);
  pointOptions.style = createStyle;
  pointOptions.condition = () => !listenKey?.isKeyDown();
  drawPoint = new DrawBasicShape(map, pointOptions, pointInteractionId);
  const lineOptions = DrawBasicShape.getDefaultLineOptions(source);
  lineOptions.style = createStyle;
  lineOptions.condition = () => !listenKey?.isKeyDown();
  drawLine = new DrawBasicShape(map, lineOptions, lineInteractionId);
  // Setup modify and translate drawing. Delete with delete+click.
  modify = new Modify(map, {
    // Use loadash "overEvery", "overSome" and "negate" to chain conditions.
    deleteCondition: conditionThen(
      overEvery(
        click,
        condition(() => listenKey.isKeyDown())
      ),
      delayOnDeleteAction.bind(this)
    ),
    source,
    style: createStyle,
  });
  translate = new Translate(map, {
    layers: [drawLayer],
    condition: platformModifierKeyOnly,
  });
  snap = new Snap(map, {
    source,
  });
  // Custom listener for this component.
  eventKeys.push(
    ...[
      drawPoint.getInteraction().on('drawend', (evt) => {
        print(`Point ${evt.feature['ol_uid']} added.`);
      }),
      drawLine.getInteraction().on('drawend', (evt) => {
        print(`Line ${evt.feature['ol_uid']} added.`);
      }),
    ]
  );
};

/**
 * Not ol-comfy, but nice to have to customize style.
 */
const createStyle = (
  feature: OlFeature<OlGeometry> | RenderFeature
): OlStyle | OlStyle[] => {
  const geometry = feature?.getGeometry();
  const type = geometry?.getType();
  if (['MultiPoint', 'Point'].includes(type) && geometry) {
    // Get color from the geometry, could be linked to a feature property as
    // well (f.i. with a color picker that set feature's value).
    const xCoordinate = (geometry as OlGeomPoint).getCoordinates()[0] || 0;
    const color = Math.round((Math.abs(xCoordinate) / (20037508 / 2)) * 255);
    return new OlStyle({
      image: new OlCircle({
        radius: 8,
        fill: new OlFill({
          color: `rgba(${color}, 0, 0, 0.7)`,
        }),
        stroke: new OlStroke({
          color: `rgba(${color}, 0, 0, 0.7)`,
        }),
      }),
    });
  } else if (['LineString', 'MultiLineString'].includes(type) && geometry) {
    return new OlStyle({
      stroke: new OlStroke({
        color: 'rgba(200, 150, 0, 0.8)',
        width: 4,
      }),
    });
  } else {
    return EmptyStyle;
  }
};

/**
 * Delay a bit the delete action to be sur that the OpenLayers is not
 * currently modifying the feature. (Like in lines, it seems to quickly
 * add then removes a coordinates on click, even with conditions).
 */
const delayOnDeleteAction = (mapBrowserEvent: MapBrowserEvent<UIEvent>) => {
  setTimeout(() => onDeleteAction(mapBrowserEvent), 20);
};

/**
 * Not ol-comfy but nice to have to delete feature.
 * It's given as callback to the ol-comfy delete condition.
 */
const onDeleteAction = (mapBrowserEvent: MapBrowserEvent<UIEvent>) => {
  mapBrowserEvent.map.forEachFeatureAtPixel(
    mapBrowserEvent.pixel,
    (feature: OlFeature<OlGeometry> | RenderFeature) => {
      if (!overlayLayerGroup || feature instanceof RenderFeature) {
        return;
      }
      // Don't remove a line if there is more than two vertexes.
      const geometry = feature.getGeometry();
      if (
        geometry.getType() === 'LineString' &&
        (geometry as OlGeomLine).getCoordinates().length > 2
      ) {
        return;
      }
      // Remove feature
      const features =
        overlayLayerGroup.getFeaturesCollection(layer1Id)?.getArray() || [];
      if (features.includes(feature)) {
        overlayLayerGroup.removeFeatures(layer1Id, [feature]);
        // Make the pointer to be updated in Firefox;
        modify.getInteraction().setActive(false);
        modify.getInteraction().setActive(true);
      }
    }
  );
};

/**
 * Should be set on a component to remove interaction from the map.
 * Not (really) used in this demo.
 */
const destroy = (isDemo) => {
  if (isDemo) {
    return;
  }
  unByKeyAll(eventKeys);
  drawPoint?.destroy();
  drawLine?.destroy();
  modify?.destroy();
  translate?.destroy();
  snap?.destroy();
  listenKey?.destroy();
};

// Init the "component".
setupDrawing();
drawPoint.setActive(true);
destroy(true);

// Listen input to enable the right tool. With ol-comfy, enabling a
// draw tool auto-deactivate other drawing tools.
const typeSelect = document.getElementById('type');
typeSelect.addEventListener('change', (evt) => {
  if ((evt.target as HTMLInputElement).value === 'point') {
    drawPoint.setActive(true);
  } else {
    drawLine.setActive(true);
  }
});
