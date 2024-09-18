import { BehaviorSubject } from "rxjs";
import { IHero, IPlayerInitialState } from "../common/types";
import { fetchPlayerInitialState } from "../apis/PlayerStateApi";

/// Singleton Store
export class PlayerStore {
  private static _instance: PlayerStore;
  private _currency$: BehaviorSubject<number>;
  private _heroes$: BehaviorSubject<IHero[]>;
  private _buildingId$: BehaviorSubject<string>;

  private constructor() {
    // * shared player global currency state
    this._currency$ = new BehaviorSubject<number>(0);

    // * list of hired summoned heroes global state
    this._heroes$ = new BehaviorSubject<IHero[]>([]);

    // * current selected building global state by player
    this._buildingId$ = new BehaviorSubject<string>("");
  }

  public static getInstance() {
    if (!PlayerStore._instance) {
      PlayerStore._instance = new PlayerStore();

      /// TODO: move it to preloading game state for optimization
      PlayerStore._instance.loadInitialState();
    }
    return PlayerStore._instance;
  }

  public loadInitialState() {
    fetchPlayerInitialState().subscribe((state: IPlayerInitialState) => {
      this.setCurrency(state.currency);
      this.setHeroesInitialState(state.heroes);
      this.setBuildingId(state.buildings.pop() || "hire-tower");
    });
  }

  /// _currency$ Methods
  public getCurrencyObservable() {
    return this._currency$.asObservable();
  }

  public setCurrency(newCurrency: number): void {
    if (this._currency$.value !== newCurrency) {
      this._currency$.next(newCurrency);
    }
  }

  public addCurrency(amount: number): void {
    this._currency$.next(this._currency$.value + amount);
  }

  public deductCurrency(amount: number): void {
    if (this._currency$.value >= amount) {
      this._currency$.next(this._currency$.value - amount);
    }
  }

  public hasCurrency(amount: number): boolean {
    return this._currency$.value >= amount;
  }

  /// _heroes$ Methods
  private setHeroesInitialState(heroes: []): void {
    this._heroes$.next(heroes);
  }

  public getHeroesObservable() {
    return this._heroes$.asObservable();
  }

  public pushHero(hero: IHero) {
    const heroes = this._heroes$.value;
    heroes.push(hero);
    return this._heroes$.next(heroes);
  }

  /// _buildingId$ Methods
  public getBuildingObservable() {
    return this._buildingId$.asObservable();
  }

  public setBuildingId(buildingId: string) {
    this._buildingId$.next(buildingId);
  }
}
