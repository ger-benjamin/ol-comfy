import { describe, beforeEach, it, expect } from 'vitest';
import { Map } from './map';
import { ScaleLine } from 'ol/control';

describe('MapStore', () => {
  let olcMap: Map;
  beforeEach(() => {
    olcMap = new Map(Map.createEmptyMap());
  });

  it('should be created and instanced', () => {
    expect(olcMap).toBeTruthy();
    expect(olcMap.getMap()).toBeTruthy();
    expect(olcMap.getMap().getControls().getLength()).toEqual(0);
    expect(olcMap.getMap().getLayers().getLength()).toEqual(0);
  });

  it('should add control to the map', () => {
    const controlId = 'test_control';
    expect(olcMap.getMap().getControls().getArray().length).toEqual(0);
    olcMap.addControl(controlId, new ScaleLine());
    expect(olcMap.getMap().getControls().getArray().length).toEqual(1);
    olcMap.addControl(controlId, new ScaleLine());
    expect(olcMap.getMap().getControls().getArray().length).toEqual(1);
    olcMap.addControl(controlId + 'X', new ScaleLine());
    expect(olcMap.getMap().getControls().getArray().length).toEqual(2);
  });
});
