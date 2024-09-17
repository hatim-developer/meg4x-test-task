import { PlayerStore } from "../stores/PlayerStore";
import { SignpostStore } from "../stores/SignpostStore";

export class HeroesDetailsUIViewModel {
  private _playerStore: PlayerStore;
  private _signpostStore: SignpostStore;

  constructor() {
    // * shared PlayerStore instance
    this._playerStore = PlayerStore.getInstance();

    // * shared SignpostStore instance
    this._signpostStore = SignpostStore.getInstance();
  }

  public getPlayerHeroesObservable() {
    return this._playerStore.getHeroesObservable();
  }

  public getActivateHallOfHeroesObservable() {
    return this._signpostStore.getActivateHallOfHeroesObservable();
  }

  /// Heroes details panel methods
  public closeButtonClick(): void {
    this._signpostStore.deactivateHallOfHeroes();
  }
}
