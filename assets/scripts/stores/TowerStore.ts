import { BehaviorSubject } from "rxjs";
import { IHero, Nullable } from "../common/types";

/// Singleton Store
export class TowerStore {
  private static _instance: TowerStore;
  public selectedHero$: BehaviorSubject<Nullable<IHero>>;

  private constructor() {
    // * shared selectedHero state
    this.selectedHero$ = new BehaviorSubject<Nullable<IHero>>(null);
  }

  public static getInstance() {
    if (!TowerStore._instance) {
      TowerStore._instance = new TowerStore();
    }
    return TowerStore._instance;
  }

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
}
