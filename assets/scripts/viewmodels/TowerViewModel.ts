import { warn } from "cc";
import { TowerModel } from "../models/TowerModel";
import { TowerStore } from "../stores/TowerStore";
import { BehaviorSubject } from "rxjs";
import HeroModel from "../models/HeroModel";
import { Nullable } from "../common/types";
import { PlayerStore } from "../stores/PlayerStore";

export class TowerViewModel {
  private towerModel: TowerModel;
  private towerStore: TowerStore;
  private playerStore: PlayerStore;

  private _summonHeroesQueue$: BehaviorSubject<HeroModel[]>;

  constructor() {
    // * init TowerModel
    this.towerModel = new TowerModel();

    // * shared TowerStore instance
    this.towerStore = TowerStore.getInstance();

    // * shared PlayerStore instance
    this.playerStore = PlayerStore.getInstance();

    // * queue of active hired heroes, only required by view
    this._summonHeroesQueue$ = new BehaviorSubject<HeroModel[]>([]);

    this.loadData();
    this.subscribeEvents();
  }

  private loadData(): void {
    const buildingId = "hire_tower"; // TODO: get from initial_state.json

    this.towerModel.loadBuildingData(buildingId);
  }

  /// Observables Methods
  public getBuildingInfoObservable() {
    return this.towerModel.buildingInfo$;
  }

  public getHeroesListObservable() {
    return this.towerModel.heroList$;
  }

  public getSelectedHeroObservable() {
    return this.towerStore.getSelectedHeroObservable();
  }

  public getSummonHeroesQueueObservable() {
    return this._summonHeroesQueue$.asObservable();
  }

  /// Subscription Methods
  private subscribeEvents(): void {
    this.towerStore.getIsSummoningObservable().subscribe((summoning) => {
      if (!summoning) {
        setTimeout(() => {
          this.shiftSummonedHero();
        }, 30);
      }
    });
  }

  public getSelectedHero() {
    return this.towerStore.getSelectedHero();
  }

  public deselectHero(): void {
    this.towerStore.deselectHero();
  }

  public getMaxHireSlots(): number {
    return this.towerModel.getHireSlots();
  }

  public canHireHero(heroCost: number): boolean {
    return this.playerStore.hasCurrency(heroCost) && this.getHiredQueueSize() < this.getMaxHireSlots();
  }

  public getHiredQueueSize(): number {
    return this._summonHeroesQueue$.value.length;
  }

  public hireHero(): void {
    // hire selected hero
    const selectedHero: Nullable<HeroModel> = this.towerStore.getSelectedHero();

    if (selectedHero === null) {
      warn("TowerModelView:hireHero() something is too wrong, selectedHero is null, and hireHero is called!");
      return;
    }

    const hiredHeroes = this._summonHeroesQueue$.value;

    if (hiredHeroes.length >= this.getMaxHireSlots()) {
      warn("TowerModelView:hireHero() something is too wrong, heroes queue is full, and hireHero is called!");
      return;
    }

    // deselect hero first
    this.deselectHero();

    // deduct player currency
    this.playerStore.deductCurrency(selectedHero.cost);

    // push hero to queue
    hiredHeroes.push(selectedHero);
    this._summonHeroesQueue$.next(hiredHeroes);
  }

  public checkSummonHero(): void {
    const queue = this._summonHeroesQueue$.value;

    if (queue.length) {
      this.towerStore.enableSummoning();
    }
  }

  public shiftSummonedHero(): void {
    const queue = this._summonHeroesQueue$.value;

    const hero = queue.shift();
    this._summonHeroesQueue$.next(queue);

    if (hero) {
      /// TODO: Send this guy to global player heroes list
      console.warn("TowerVM TODO: shiftSummonHero() send hero to player heroes list");
    }
  }
}
