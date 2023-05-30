import OlLayerBase from 'ol/layer/Base';
import { BackgroundLayerGroup } from './background-layer-group';
import { Map } from '../map/map';
import { getLayerGroup } from '../test/test-data';
import { CommonProperties } from './layer-group';

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
    // Prepare to execute this final async test.
    bgGroup.layerPropertyChanged.subscribe((layerPropertyChanged) => {
      expect(layerPropertyChanged.layer.get(CommonProperties.LayerUid)).toEqual(
        'secondLayer'
      );
      expect(layerPropertyChanged.layer.getVisible()).toBeTruthy();
      done();
    });
    // Run the async test.
    bgGroup.toggleVisible('secondLayer');
  });
});
