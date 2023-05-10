import OlLayerBase from 'ol/layer/Base';
import { BackgroundLayerGroup } from './background-layer-group';
import { Map } from '../map/map';
import { getLayerGroup } from '../test/test-data';
import { CommonProperties } from './layer-group';
import OlLayerGroup from 'ol/layer/Group';

describe('BackgroundLayerGroup', () => {
  let bgGroup: BackgroundLayerGroup;
  let baseLayer: OlLayerBase;
  beforeEach(() => {
    bgGroup = new BackgroundLayerGroup(Map.createEmptyMap());
    baseLayer = new OlLayerBase({});
  });

  it('should toggleVisible', (done) => {
    const secondLayer = new OlLayerBase({});
    const expectedGroup = getLayerGroup(bgGroup, 0).getLayers().getArray();
    bgGroup.addLayer(baseLayer, 'firstLayer');
    bgGroup.addLayer(secondLayer, 'secondLayer');
    expect(expectedGroup.length).toEqual(2);
    bgGroup.toggleVisible('secondLayer');
    expect(expectedGroup[0].getVisible()).toBeFalsy();
    expect(expectedGroup[1].getVisible()).toBeTruthy();
    bgGroup.toggleVisible('firstLayer');
    expect(expectedGroup[0].getVisible()).toBeTruthy();
    expect(expectedGroup[1].getVisible()).toBeFalsy();
    // Wait the events to execute this final async test
    let eventsCounter = 0;
    bgGroup.getLayerGroup().on('change', (event) => {
      // Two layers = two events.
      eventsCounter++;
      if (eventsCounter === 2) {
        const layerGroup = event.target as OlLayerGroup;
        const visibleLayer = layerGroup
          .getLayers()
          .getArray()
          .find((layer) => layer.getVisible());
        expect(visibleLayer?.get(CommonProperties.LayerUid)).toEqual(
          'secondLayer'
        );
        done();
      }
    });
    bgGroup.toggleVisible('secondLayer');
  });
});
