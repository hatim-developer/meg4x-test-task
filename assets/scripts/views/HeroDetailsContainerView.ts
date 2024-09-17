import { _decorator, Component, Label, log, Sprite } from "cc";
import { EHeroSprite, Nullable, TSpriteFrameDict } from "../common/types";
import { Subscription } from "rxjs";
import { HeroDetailsContainerViewModel } from "../viewmodels/HeroDetailsContainerViewModel";
const { ccclass, property } = _decorator;

@ccclass("HeroDetailsContainerView")
export class HeroDetailsContainerView extends Component {
  @property({
    type: Sprite
  })
  public spriteHeroFace: Nullable<Sprite> = null;

  @property({
    type: Sprite
  })
  public spriteHeroRank: Nullable<Sprite> = null;

  @property({
    type: Sprite
  })
  public spriteHeroType: Nullable<Sprite> = null;

  @property({
    type: Label
  })
  public labelHeroName: Nullable<Label> = null;

  @property({
    type: Label
  })
  public labelHeroDesc: Nullable<Label> = null;

  @property({
    type: Label
  })
  public labelHeroRank: Nullable<Label> = null;

  @property({
    type: Label
  })
  public labelHeroCost: Nullable<Label> = null;

  @property({
    type: Label
  })
  public labelHeroType: Nullable<Label> = null;

  @property({
    type: Label
  })
  public labelHeroTime: Nullable<Label> = null;

  private _heroDetailsViewModel: Nullable<HeroDetailsContainerViewModel> = null;

  public setViewModel(heroVM: HeroDetailsContainerViewModel) {
    this._heroDetailsViewModel = heroVM;
  }

  public getViewModel() {
    return this._heroDetailsViewModel;
  }

  private _subscription: Subscription[] = [];

  /// Lifecycle Methods
  protected onLoad(): void {
    this.subscribeEvents();
  }
  protected start(): void {
    this.updateHeroDetails();
  }

  private subscribeEvents(): void {
    if (this._heroDetailsViewModel) {
      const spriteFramesSub = this._heroDetailsViewModel.getSpriteFramesObservable().subscribe((value) => {
        if (value === null) {
          return;
        }
        this.onFramesLoad(value);
      });

      // * save subscriptions for cleaning
      this._subscription.push(spriteFramesSub);
    }
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    this._subscription.forEach((sub) => sub.unsubscribe);
  }

  /// Subscriber Methods
  private onFramesLoad(spriteFramesDict: TSpriteFrameDict): void {
    log("HeroDetailsContainerView: Frames loaded", spriteFramesDict); // __DEBUG__

    this.updateSpriteFrames(spriteFramesDict);
  }

  /// UI Methods
  private updateSpriteFrames(spriteFramesDict: TSpriteFrameDict): void {
    if (this.spriteHeroFace) {
      this.spriteHeroFace.spriteFrame = spriteFramesDict[EHeroSprite.face]!;
    }

    if (this.spriteHeroRank) {
      this.spriteHeroRank.spriteFrame = spriteFramesDict[EHeroSprite.rank]!;
    }

    if (this.spriteHeroType) {
      this.spriteHeroType.spriteFrame = spriteFramesDict[EHeroSprite.type]!;
    }
  }

  private updateHeroDetails() {
    const heroDetails = this._heroDetailsViewModel?.getHeroDetails();

    if (!heroDetails) {
      log("HeroDetailsContainerView: updateHeroDetails details not available "); // __DEBUG__
      return;
    }

    if (this.labelHeroName) {
      this.labelHeroName.string = heroDetails.name;
    }

    if (this.labelHeroDesc) {
      this.labelHeroDesc.string = heroDetails.description;
    }

    if (this.labelHeroCost) {
      this.labelHeroCost.string = `Cost: ${heroDetails.cost}`;
    }

    if (this.labelHeroRank) {
      this.labelHeroRank.string = `Rank: ${heroDetails.rank.toUpperCase()}`;
    }

    if (this.labelHeroType) {
      this.labelHeroType.string = `Type: ${heroDetails.type.toUpperCase()}`;
    }

    if (this.labelHeroTime) {
      this.labelHeroTime.string = `Summon Time: ${heroDetails.summonCoolDown}s`;
    }
  }
}
