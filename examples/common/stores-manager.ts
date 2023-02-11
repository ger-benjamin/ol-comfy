import { MapStore } from '../../src/map/map-store';

interface Stores {
  map?: MapStore;
}

export class StoresManager {
  private stores: { [key: string]: Stores } = {};

  getMapStore(storesId: string): MapStore {
    this.maybeCreateStores(storesId);
    return this.stores[storesId].map as MapStore;
  }

  destroyStores(storesId: string) {
    delete this.stores[storesId];
  }

  /**
   * Create every store if the storesId key doesn't have any store.
   * @param storesId
   * @private
   */
  private maybeCreateStores(storesId: string) {
    if (this.stores[storesId]) {
      return;
    }
    this.stores[storesId] = {};
    this.stores[storesId].map = new MapStore();
  }
}

const storesManager = new StoresManager();
export default storesManager;
