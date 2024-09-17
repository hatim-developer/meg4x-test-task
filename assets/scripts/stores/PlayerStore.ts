import { BehaviorSubject } from "rxjs";

/// Singleton Store
export class PlayerStore {
  private static _instance: PlayerStore;
  private _currency$: BehaviorSubject<number>;

  private constructor() {
    // * shared player global currency state
    this._currency$ = new BehaviorSubject<number>(9999999);
  }

  public static getInstance() {
    if (!PlayerStore._instance) {
      PlayerStore._instance = new PlayerStore();
    }
    return PlayerStore._instance;
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
}
