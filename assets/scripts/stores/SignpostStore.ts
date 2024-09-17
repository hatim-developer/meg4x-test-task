import { BehaviorSubject } from "rxjs";

/// Singleton Store
export class SignpostStore {
  private static _instance: SignpostStore;
  private activateHallOfHeroes$: BehaviorSubject<boolean>;

  private constructor() {
    // * shared hall of heroes (heroes details panel) activation state
    this.activateHallOfHeroes$ = new BehaviorSubject<boolean>(false);
  }

  public static getInstance() {
    if (!SignpostStore._instance) {
      SignpostStore._instance = new SignpostStore();
    }
    return SignpostStore._instance;
  }

  /// activateHallOfHeroes$ Methods
  activateHallOfHeroes(): void {
    if (this.activateHallOfHeroes$.value) {
      return;
    }
    this.activateHallOfHeroes$.next(true);
  }

  deactivateHallOfHeroes(): void {
    if (this.activateHallOfHeroes$.value) {
      this.activateHallOfHeroes$.next(false);
    }
  }

  getActivateHallOfHeroesObservable() {
    return this.activateHallOfHeroes$.asObservable();
  }
}
