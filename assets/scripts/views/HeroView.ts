import { _decorator, Component, EventTouch, Graphics, Input, log, Sprite, UIOpacity, UITransform } from "cc";
import { EHeroSprite, IHero, Nullable, TSpriteFrameDict } from "../common/types";
import { HeroViewModel } from "../viewmodels/HeroViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("HeroView")
export class HeroView extends Component {
  @property({
    type: Sprite
  })
  public spriteHeroFace: Nullable<Sprite> = null;

  @property({
    type: Sprite
  })
  public spriteHeroRank: Nullable<Sprite> = null;

  @property({
    type: Graphics
  })
  public graphicHeroPortrait: Nullable<Graphics> = null;

  public heroViewModel: Nullable<HeroViewModel> = null;

  public setViewModel(heroVM: HeroViewModel) {
    this.heroViewModel = heroVM;
  }

  private _subscription: Subscription[] = [];

  /// Lifecycle Methods
  protected onLoad(): void {
    this.subscribeEvents();
  }

  private subscribeEvents(): void {
    if (this.heroViewModel) {
      const spriteFramesSub = this.heroViewModel.getSpriteFramesObservable().subscribe((value) => {
        if (value === null) {
          return;
        }
        this.onFramesLoad(value);
      });

      const selectedHeroSub = this.heroViewModel.getSelectedHeroObservable().subscribe((selectedHero) => {
        this.onHeroSelect(selectedHero);
      });

      // * save subscriptions for cleaning
      this._subscription.push(spriteFramesSub, selectedHeroSub);
    }
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    this._subscription.forEach((sub) => sub.unsubscribe);
    this.node.off(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
  }

  /// Subscriber Methods
  private onFramesLoad(spriteFramesDict: TSpriteFrameDict): void {
    this.updateSpriteFrames(spriteFramesDict);
    this.activate();
  }

  private onHeroSelect(hero: Nullable<IHero>) {
    if (hero === null) {
      this.highlightPortrait(false);
      return;
    }

    if (this.heroViewModel) {
      this.highlightPortrait(this.heroViewModel.canHighlightPortrait(hero.id));
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
  }

  private activate(): void {
    const opacityComp = this.node.getComponent(UIOpacity);

    if (opacityComp) {
      opacityComp.opacity = 255;
    }

    this.addTouchListener();
  }

  private highlightPortrait(visible: boolean = true): void {
    const ctx = this.graphicHeroPortrait;

    if (!ctx) {
      return;
    }

    ctx.clear();

    if (visible) {
      const transformComp = this.node.getComponent(UITransform);
      const width = (transformComp?.width ?? 100) - 5;
      const height = (transformComp?.height ?? 105) - 5;

      ctx.lineWidth = 8;
      ctx.rect(-width / 2, -height / 2, width, height);
      ctx.stroke();
    }
  }

  /// Event Callbacks
  private addTouchListener(): void {
    this.node.off(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
    this.node.on(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
  }

  private onTouchEndEvent(event: EventTouch) {
    event.propagationStopped = true;
    this.highlightPortrait();

    if (this.heroViewModel) {
      this.heroViewModel.selectHero();
    }
  }
}
