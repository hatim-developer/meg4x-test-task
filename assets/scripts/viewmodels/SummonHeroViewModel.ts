import { BehaviorSubject, Subscription, forkJoin, interval, map, takeWhile } from "rxjs";
import { EHeroSprite, IHero, Nullable, TSpriteFrameDict } from "../common/types";
import { fetchSpriteFrame } from "../apis/SpriteFrameApi";
import { log, warn } from "cc";
import { TowerStore } from "../stores/TowerStore";

export class SummonHeroViewModel {
  private _spriteFrames$: BehaviorSubject<Nullable<TSpriteFrameDict>>;
  private _summonProgress$: BehaviorSubject<number>;

  private _heroModel: Nullable<IHero>;
  private _towerStore: TowerStore;
  private _progressSubscription: Nullable<Subscription>;
  private _isSummoningHeroSubscription: Nullable<Subscription>;

  constructor() {
    // * hero model data class
    this._heroModel = null;

    // * state sprite frames
    this._spriteFrames$ = new BehaviorSubject<Nullable<TSpriteFrameDict>>(null);

    // * summoning progress state
    this._summonProgress$ = new BehaviorSubject<number>(0);

    // * shared TowerStore instance
    this._towerStore = TowerStore.getInstance();

    this._progressSubscription = null;
    this._isSummoningHeroSubscription = null;
  }

  resetHeroData() {
    if (this._heroModel === null) {
      return;
    }

    warn("SummonHeroVM: TODO: resetHeroData()", this._heroModel);
    const resetFrames: TSpriteFrameDict = {
      [EHeroSprite.face]: undefined,
      [EHeroSprite.rank]: undefined,
      [EHeroSprite.type]: undefined
    };
    this._spriteFrames$.next(resetFrames);

    if (this._summonProgress$.value >= 1) {
      this._summonProgress$.next(0);
    }

    this._progressSubscription?.unsubscribe();
    this._isSummoningHeroSubscription?.unsubscribe();
    this._heroModel = null;
  }

  setHeroData(hero: IHero, canSummon: boolean) {
    if (this._heroModel && this._heroModel.id === hero.id) {
      log("SummonHeroVM: setData() same hero assigned, id: ", hero.id);
      return;
    }
    this._heroModel = hero;

    // * loading sprite frames dynamically
    this.loadSpriteFrames();

    // * subscribe to summoningHero
    if (canSummon) {
      this.subscribeSummoningHero();
      this._summonProgress$.next(0);
    }
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

  /// Observables getters
  public getSpriteFramesObservable() {
    return this._spriteFrames$.asObservable();
  }

  public getSummonProgressObservable() {
    return this._summonProgress$.asObservable();
  }

  public getSelectedHeroObservable() {
    return this._towerStore.getSelectedHeroObservable();
  }

  /// Subscription Methods
  private subscribeSummoningHero(): void {
    this._isSummoningHeroSubscription?.unsubscribe();
    this._isSummoningHeroSubscription = this._towerStore.getIsSummoningObservable().subscribe((summoning) => {
      if (summoning) {
        this.summonHero();
      }
    });
  }

  public summonHero(): void {
    if (!this._heroModel) {
      warn("SummonHeroVM:summonHero() something is too wrong, summon hero data is null, and summonHero is called!");
    }

    if (this._progressSubscription) {
      warn("SummonHeroVM:summonHero(), already progress sub is running clearing it.");
      this._progressSubscription?.unsubscribe();
    }

    const limit = this._heroModel!.summonCoolDown;

    // Each second updating progress bar
    this._progressSubscription = interval(1000)
      .pipe(
        map((sec) => (sec + 1) / limit),
        takeWhile((progress) => progress <= 1)
      )
      .subscribe((progress) => {
        const _progress = Math.min(progress, 1);
        this._summonProgress$.next(_progress);

        /// Summoning completed
        if (_progress === 1) {
          this.onSummonComplete();
        }
      });
  }

  private onSummonComplete(): void {
    log("SummonHeroVM summon completed", this._heroModel?.id);
    this._progressSubscription?.unsubscribe();
    this._progressSubscription = null;
    this._towerStore.clearSummoning();
  }
}
