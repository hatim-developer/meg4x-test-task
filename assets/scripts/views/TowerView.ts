import { _decorator, Button, Component, Label, Layout, Sprite, UIOpacity } from "cc";
import { TowerViewModel } from "../viewmodels/TowerViewModel";
import { Subscription } from "rxjs";
import { IBuildingInfo, IHero, Nullable } from "../common/types";
const { ccclass, property } = _decorator;

@ccclass("TowerView")
export class TowerView extends Component {
  private _towerViewModel?: TowerViewModel;
  private _subscription: Subscription[] = [];

  @property({
    type: Label
  })
  public labelPanelTitle: Nullable<Label> = null;

  @property({
    type: Label
  })
  public labelPanelDesc: Nullable<Label> = null;

  @property({
    type: Layout
  })
  public layoutSummonQueue: Nullable<Layout> = null;

  @property({
    type: Layout
  })
  public layoutHeroesList: Nullable<Layout> = null;

  @property({
    type: Button
  })
  public buttonHire: Nullable<Button> = null;

  @property({
    type: Label
  })
  public labelHireCost: Nullable<Label> = null;

  @property({
    type: Sprite
  })
  public spriteHireCurrency: Nullable<Sprite> = null;

  get towerViewModel() {
    return this._towerViewModel!;
  }

  /// Lifecycle Methods
  protected onLoad(): void {
    // * init TowerVM
    this._towerViewModel = new TowerViewModel();
    this._subscription = [];

    this.resetUI();
  }

  start() {
    this.subscribeEvents();
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    this._subscription.forEach((sub) => sub.unsubscribe);
  }

  private subscribeEvents(): void {
    const buildingInfoSub = this.towerViewModel.getBuildingInfoObservable().subscribe((info) => {
      this.onNewBuildingInfo(info);
    });

    const heroesListSub = this.towerViewModel.getHeroesListObservable().subscribe((heroes) => {
      this.onNewHeroes(heroes);
    });

    // * save subscriptions for cleaning
    this._subscription.push(buildingInfoSub, heroesListSub);
  }

  /// Subscriber Methods
  private onNewBuildingInfo(building: Nullable<IBuildingInfo>) {
    if (building === null) {
      // TODO: _HANDLE_CASE_ : show loading state
      console.warn("TowerView building info is null");
      return;
    }
    this.updateBuildingDetails(building);
  }

  private onNewHeroes(heroes: IHero[]) {
    if (heroes === null || !heroes?.length) {
      console.warn("TowerView no heroes to show");
      return;
    }

    // TODO: render heroes list
  }

  /// UI Methods
  private updateBuildingDetails(building: IBuildingInfo): void {
    console.log("TowerView updatingBuildingInfo() : info", building); // _DEBUG_
    this.labelPanelTitle!.string = building.name;
    this.labelPanelDesc!.string = building.description;
  }

  private resetUI(): void {
    this.labelPanelTitle!.string = "";
    this.labelPanelDesc!.string = "";
    this.layoutSummonQueue!.node.removeAllChildren();
    this.layoutHeroesList!.node.removeAllChildren();

    this.resetHireButton();
  }

  private resetHireButton(): void {
    if (this.buttonHire) {
      this.buttonHire.interactable = false;

      const opacityComp = this.buttonHire.getComponent(UIOpacity);
      if (opacityComp) {
        opacityComp.opacity = 100;
      }
    }
    this.labelHireCost!.string = "";
    this.spriteHireCurrency!.node.active = false;
  }
}
