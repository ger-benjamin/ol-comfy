import { describe, it, expect } from 'vitest';
import OlCollection from 'ol/Collection';
import { insertAtKeepOrder } from './collection';
import OlBaseObject from 'ol/Object';

describe('Collection', () => {
  it('insertAtKeepOrder', () => {
    const key = 'order';
    const l = 'letter';
    const collection: OlCollection<OlBaseObject> = new OlCollection();
    insertAtKeepOrder(collection, new OlBaseObject({ [l]: 'a' }), key, 0);
    insertAtKeepOrder(collection, new OlBaseObject({ [l]: 'c' }), key, 1);
    insertAtKeepOrder(collection, new OlBaseObject({ [l]: 'e' }), key, 3);
    insertAtKeepOrder(collection, new OlBaseObject({ [l]: 'd' }), key, 2);
    insertAtKeepOrder(collection, new OlBaseObject({ [l]: 'b' }), key, 1);
    const order = collection.getArray().map((obj: OlBaseObject) => obj.get(l));
    expect(order).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
