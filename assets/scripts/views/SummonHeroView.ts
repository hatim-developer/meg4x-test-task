import { _decorator, Component, log, ProgressBar, Sprite, UIOpacity } from "cc";
import { EHeroSprite, Nullable, TSpriteFrameDict } from "../common/types";
import { Subscription } from "rxjs";
import { SummonHeroViewModel } from "../viewmodels/SummonHeroViewModel";
const { ccclass, property } = _decorator;

@ccclass("SummonHeroView")
export class SummonHeroView extends Component {
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
    type: ProgressBar
  })
  public progressBarSummon: Nullable<ProgressBar> = null;

  private summonHeroViewModel: Nullable<SummonHeroViewModel> = null;

  public getViewModel() {
    return this.summonHeroViewModel;
  }

  private _subscription: Subscription[] = [];

  /// Lifecycle Methods
  protected onLoad(): void {
    this.summonHeroViewModel = new SummonHeroViewModel();
    this.subscribeEvents();
  }

  private subscribeEvents(): void {
    if (this.summonHeroViewModel) {
      const spriteFramesSub = this.summonHeroViewModel.getSpriteFramesObservable().subscribe((value) => {
        if (value === null) {
          return;
        }
        this.onFramesLoad(value);
      });

      const summonProgressSub = this.summonHeroViewModel.getSummonProgressObservable().subscribe((progress) => {
        this.onSummonProgress(progress);
      });

      // * save subscriptions for cleaning
      this._subscription.push(spriteFramesSub, summonProgressSub);
    }
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    this._subscription.forEach((sub) => sub.unsubscribe);
  }

  /// Subscriber Methods
  private onFramesLoad(spriteFramesDict: TSpriteFrameDict): void {
    log("SummonHeroView: Frames loaded", spriteFramesDict); // __DEBUG__

    this.updateSpriteFrames(spriteFramesDict);
    this.activate();
  }

  private onSummonProgress(progress: number): void {
    log("SummonHeroView: Summon progress: ", progress); // __DEBUG__

    if (this.progressBarSummon) {
      this.progressBarSummon.progress = progress;
    }
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

  private activate(): void {
    const opacityComp = this.spriteHeroFace?.getComponent(UIOpacity);

    if (opacityComp) {
      opacityComp.opacity = 255;
    }
  }
}
