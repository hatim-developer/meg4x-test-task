import { PlayerStore } from "../stores/PlayerStore";

export class CurrencyViewModel {
  private _playerStore: PlayerStore;

  constructor() {
    // * shared PlayerStore instance
    this._playerStore = PlayerStore.getInstance();
  }

  public getCurrencyObservable() {
    return this._playerStore.getCurrencyObservable();
  }
}
