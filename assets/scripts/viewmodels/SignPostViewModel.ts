import { PlayerStore } from "../stores/PlayerStore";

export class SignPostViewModel {
  private _playerStore: PlayerStore;

  constructor() {
    // * shared PlayerStore instance
    this._playerStore = PlayerStore.getInstance();
  }

  public getPlayerHeroesObservable() {
    return this._playerStore.getHeroesObservable();
  }
}
