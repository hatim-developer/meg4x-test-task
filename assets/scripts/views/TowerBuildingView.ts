import { _decorator, Component, EventTouch, Input, log, Sprite } from "cc";
import { Nullable } from "../common/types";
import { TowerBuildingViewModel } from "../viewmodels/TowerBuildingViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("TowerBuildingView")
export class TowerBuildingView extends Component {
  private _towerBuildingViewModel?: TowerBuildingViewModel;

  private _towerUISub: Nullable<Subscription> = null;
  private _summoningSub: Nullable<Subscription> = null;

  @property({
    type: Sprite
  })
  public spriteSummoningIcon: Nullable<Sprite> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    // * instantiate CurrencyVM
    this._towerBuildingViewModel = new TowerBuildingViewModel();

    this._towerUISub = null;
    this._summoningSub = null;

    this.subscribeEvents();
  }

  start() {
    // * listen to building click
    this.node.on(Input.EventType.TOUCH_END, this.onTowerBuildingClick, this);
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._towerUISub?.unsubscribe();
    this._summoningSub?.unsubscribe();

    this.node.off(Input.EventType.TOUCH_END, this.onTowerBuildingClick, this);
  }

  /// Subscriptions
  private subscribeEvents(): void {
    if (this._towerBuildingViewModel) {
      // subscribe to tower ui activation event
      this._towerUISub = this._towerBuildingViewModel.getActivateTowerObservable().subscribe((towerShown) => {
        if (towerShown) {
          this._summoningSub?.unsubscribe();
          this.showSummonIcon(false);
          return;
        }

        // subscribe to summoning only if tower ui deactivated
        this.subscribeToSummoningState();
      });
    }
  }

  private subscribeToSummoningState() {
    if (this._towerBuildingViewModel) {
      this._summoningSub = this._towerBuildingViewModel?.getSummoningObservable().subscribe((isSummoning: boolean) => {
        this.showSummonIcon(isSummoning);
      });
    }
  }

  /// UI Methods
  private showSummonIcon(visibility: boolean) {
    if (this.spriteSummoningIcon) {
      this.spriteSummoningIcon.node.active = visibility;
    }
  }

  // Event Listeners
  private onTowerBuildingClick(event: EventTouch): void {
    event.propagationStopped = true;
    log("TowerBuildingView onTowerBuildingClick()"); // !_DEBUG

    this._towerBuildingViewModel?.showTowerPanel();
  }
}
