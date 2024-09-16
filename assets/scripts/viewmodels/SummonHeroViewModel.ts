import { BehaviorSubject, forkJoin, interval, map, takeWhile } from "rxjs";
import { EHeroSprite, IHero, Nullable, TSpriteFrameDict } from "../common/types";
import { fetchSpriteFrame } from "../apis/SpriteFrameApi";
import { log, warn } from "cc";
import { TowerStore } from "../stores/TowerStore";

export class SummonHeroViewModel {
  private _spriteFrames$: BehaviorSubject<Nullable<TSpriteFrameDict>>;
  private _summonProgress$: BehaviorSubject<number>;

  private _heroModel: Nullable<IHero>;
  private _towerStore: TowerStore;

  constructor() {
    // * hero model data class
    this._heroModel = null;

    // * state sprite frames
    this._spriteFrames$ = new BehaviorSubject<Nullable<TSpriteFrameDict>>(null);

    // * summoning progress state
    this._summonProgress$ = new BehaviorSubject<number>(0);

    // * shared TowerStore instance
    this._towerStore = TowerStore.getInstance();
  }

  resetHeroData() {
    if (this._heroModel === null) {
      return;
    }

    warn("SummonHeroVM: TODO: resetHeroData()");
  }

  setHeroData(hero: IHero) {
    if (this._heroModel && this._heroModel.id === hero.id) {
      log("SummonHeroVM: setData() same hero assigned, id: ", hero.id);
      return;
    }
    this._heroModel = hero;

    // * loading sprite frames dynamically
    this.loadSpriteFrames();
  }

  private loadSpriteFrames() {
    if (this._heroModel === null) {
      return;
    }

    const basePath = "dynamic_sprites/heroes/";
    const face$ = fetchSpriteFrame(basePath + this._heroModel.id);
    const rank$ = fetchSpriteFrame(`${basePath}ui/${this._heroModel.rank}_highlight`);
    const type$ = fetchSpriteFrame(`${basePath}ui/att_${this._heroModel.type}`);

    forkJoin({
      [EHeroSprite.face]: face$,
      [EHeroSprite.rank]: rank$,
      [EHeroSprite.type]: type$
    }).subscribe({
      next: (spriteFramesDict: TSpriteFrameDict) => {
        this._spriteFrames$.next(spriteFramesDict);
      },
      error: (err) => {
        warn("SummonHeroVM loadSpriteFrames Error: ", err);
        // TODO : __HANDLE_CASE__ optimize to ignore failed assets
      }
    });
  }

  public getSpriteFramesObservable() {
    return this._spriteFrames$.asObservable();
  }

  public getSummonProgressObservable() {
    return this._summonProgress$.asObservable();
  }

  public getSelectedHeroObservable() {
    return this._towerStore.getSelectedHeroObservable();
  }

  public summonHero() {
    if (!this._heroModel) {
      warn("SummonHeroVM:summonHero() something is too wrong, summon hero data is null, and summonHero is called!");
    }

    // Each second updating progress bar
    interval(1000)
      .pipe(
        map((sec) => sec / this._heroModel!.summonCoolDown),
        takeWhile((progress) => progress <= 1)
      )
      .subscribe((progress) => {
        this._summonProgress$.next(Math.min(progress, 1));
      });
  }
}
