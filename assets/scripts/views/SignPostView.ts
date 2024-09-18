import { _decorator, Component, EventTouch, Input, Label, log, Node, Sprite } from "cc";
import { Nullable } from "../common/types";
import { SignPostViewModel } from "../viewmodels/SignPostViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("SignPostView")
export class SignPostView extends Component {
  private _signPostViewModel?: SignPostViewModel;
  private _subscription?: Subscription;

  @property({
    type: Sprite
  })
  public spriteBadgeBg: Nullable<Sprite> = null;

  @property({
    type: Label
  })
  public labelBadgeCount: Nullable<Label> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    // * instantiate CurrencyVM
    this._signPostViewModel = new SignPostViewModel();
  }

  start() {
    this.subscribeEvents();

    this.node.on(Input.EventType.TOUCH_END, this.onSignPostIconClick, this);
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription?.unsubscribe();

    this.node.off(Input.EventType.TOUCH_END, this.onSignPostIconClick, this);
  }

  /// Subscriptions
  private subscribeEvents(): void {
    this._subscription = this._signPostViewModel?.getPlayerHeroesObservable().subscribe((heroes) => {
      this.onHeroesCountChange(heroes.length);
    });
  }

  /// UI Methods
  private onHeroesCountChange(newCount: number) {
    let visibility = newCount > 0;

    if (this.labelBadgeCount) {
      this.labelBadgeCount.node.active = visibility;
      this.labelBadgeCount.string = newCount.toString();
    }

    if (this.spriteBadgeBg) {
      this.spriteBadgeBg.node.active = visibility;
    }
  }

  /// Event Listeners
  private onSignPostIconClick(event: EventTouch): void {
    event.propagationStopped = true;
    this._signPostViewModel?.showHallOfHeroesPanel();
  }
}
