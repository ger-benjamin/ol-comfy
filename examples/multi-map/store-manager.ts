import { MapStore } from '../../src/map/map-store';

interface Store {
  map?: MapStore;
}

/**
 * A instance that create, provide and delete store.
 * Exposed as a singleton, it allows you to manage easily all of your stores.
 */
export class StoreManager {
  private stores: { [key: string]: Store } = {};

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

// Expose it as singleton.
const storeManager = new StoreManager();
export default storeManager;
