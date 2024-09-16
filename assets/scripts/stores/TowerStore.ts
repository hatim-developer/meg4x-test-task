import { BehaviorSubject } from "rxjs";
import { IHero, Nullable } from "../common/types";

/// Singleton Store
export class TowerStore {
  private static _instance: TowerStore;
  private selectedHero$: BehaviorSubject<Nullable<IHero>>;
  private isSummoning$: BehaviorSubject<boolean>;

  private constructor() {
    // * shared selectedHero state
    this.selectedHero$ = new BehaviorSubject<Nullable<IHero>>(null);

    // * shared summoning hero state
    this.isSummoning$ = new BehaviorSubject<boolean>(false);
  }

  public static getInstance() {
    if (!TowerStore._instance) {
      TowerStore._instance = new TowerStore();
    }
    return TowerStore._instance;
  }

  /// selectedHero$ Methods
  setSelectedHero(hero: IHero): void {
    if (this.selectedHero$.value?.id === hero.id) {
      return;
    }
    this.selectedHero$.next(hero);
  }

  deselectHero(): void {
    if (this.selectedHero$.value === null) {
      return;
    }
    this.selectedHero$.next(null);
  }

  getSelectedHeroObservable() {
    return this.selectedHero$.asObservable();
  }

  getSelectedHero() {
    return this.selectedHero$.value;
  }

  /// iSummoning$ Methods
  enableSummoning(): void {
    if (this.isSummoning$.value) {
      return;
    }
    this.isSummoning$.next(true);
  }

  clearSummoning(): void {
    if (this.isSummoning$.value) {
      this.isSummoning$.next(false);
    }
  }

  getIsSummoningObservable() {
    return this.isSummoning$.asObservable();
  }

  isSummoningHero() {
    return this.isSummoning$.value;
  }
}
