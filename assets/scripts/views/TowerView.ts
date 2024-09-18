import {
  _decorator,
  Button,
  Component,
  instantiate,
  Label,
  Layout,
  Prefab,
  Sprite,
  UIOpacity,
  warn,
  Node,
  Input,
  log,
  EventTouch,
  Color,
  tween,
  Vec3,
  view,
  UITransform
} from "cc";
import { TowerViewModel } from "../viewmodels/TowerViewModel";
import { Subscription } from "rxjs";
import { IBuildingInfo, IHero, Nullable } from "../common/types";
import { HeroViewModel } from "../viewmodels/HeroViewModel";
import { HeroView } from "./HeroView";
import { SummonHeroView } from "./SummonHeroView";

const { ccclass, property } = _decorator;

@ccclass("TowerView")
export class TowerView extends Component {
  private _towerViewModel?: TowerViewModel;
  private _subscription: Subscription[] = [];

  @property({
    type: Node
  })
  public blockTouchNode: Nullable<Node> = null;

  @property({
    type: Node
  })
  public towerPanelNode: Nullable<Node> = null;

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
    type: Prefab
  })
  public prefabHero: Nullable<Prefab> = null;

  @property({
    type: Prefab
  })
  public prefabSummonHero: Nullable<Prefab> = null;

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
    this.subscribeEvents();
  }

  start() {
    this.addTouchListeners();
  }

  private addTouchListeners(): void {
    // to listen outside clicks
    if (this.towerPanelNode && this.blockTouchNode) {
      this.blockTouchNode.on(Input.EventType.TOUCH_START, this.onBlockTouchNodeClick, this);

      this.towerPanelNode.on(Input.EventType.TOUCH_START, this.onTowerPanelNodeClick, this);
    }
  }

  private cleanTouchListeners(): void {
    this.enableHireButtonTouchListener(false);

    if (this.towerPanelNode && this.blockTouchNode) {
      this.blockTouchNode.off(Input.EventType.TOUCH_START, this.onBlockTouchNodeClick, this);

      this.towerPanelNode.off(Input.EventType.TOUCH_START, this.onTowerPanelNodeClick, this);
    }
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription.forEach((sub) => sub.unsubscribe);

    // * Touch listeners cleanup
    this.cleanTouchListeners();
  }

  /// Subscriptions
  private subscribeEvents(): void {
    const activateTowerSub = this.towerViewModel.getActivateTowerObservable().subscribe((show) => {
      this.onTowerUIRequest(show);
    });

    const buildingInfoSub = this.towerViewModel.getBuildingInfoObservable().subscribe((info) => {
      this.onNewBuildingInfo(info);
    });

    const heroesListSub = this.towerViewModel.getHeroesListObservable().subscribe((heroes) => {
      this.onNewHeroes(heroes);
    });

    const selectedHeroSub = this.towerViewModel.getSelectedHeroObservable().subscribe((selectedHero) => {
      this.onHeroSelect(selectedHero);
    });

    const summonHeroesQueueSub = this.towerViewModel.getSummonHeroesQueueObservable().subscribe((summonHeroes) => {
      this.onSummonQueueChange(summonHeroes);
    });

    // * save subscriptions for cleaning
    this._subscription.push(activateTowerSub, buildingInfoSub, heroesListSub, selectedHeroSub, summonHeroesQueueSub);
  }

  /// Subscriber Methods
  private onNewBuildingInfo(building: Nullable<IBuildingInfo>) {
    if (building === null) {
      // TODO: _HANDLE_CASE_ : show loading state
      return;
    }
    this.updateBuildingDetails(building);
    this.createSummonQueueFrames();
  }

  private onNewHeroes(heroes: IHero[]) {
    if (!heroes?.length) {
      return;
    }

    this.updateHeroesList(heroes);
  }

  private onHeroSelect(hero: Nullable<IHero>) {
    if (hero === null) {
      this.updateHireButton(false);
      return;
    }
    this.updateHireButton(true, hero.cost);
  }

  private onSummonQueueChange(summonQueue: IHero[]): void {
    this.renderSummonQueueHeroes(summonQueue);
  }

  /// UI Methods
  private onTowerUIRequest(show: boolean) {
    if (show) {
      this.showTowerPanel();
    } else {
      this.closeTowerPanel();
    }
  }
  private showTowerPanel(): void {
    // activate node first
    this.handleNodeVisibility(true);

    if (this.towerPanelNode) {
      this.startSlideAnimation(this.towerPanelNode, this.getPanelTargetPos(), () => {
        this.handleNodeVisibility(true);
      });
    }
  }

  private closeTowerPanel(): void {
    // deselect hero
    if (this._towerViewModel) {
      this._towerViewModel.deselectHero();
    }

    if (this.towerPanelNode) {
      this.startSlideAnimation(this.towerPanelNode, this.getPanelTargetPos(true), () => {
        // remove node from rendering tree
        this.handleNodeVisibility(false);
      });
    }
  }

  private startSlideAnimation(target: Node, targetPos: Vec3, onComplete?: Function): void {
    tween(target)
      .to(0.25, { position: targetPos })
      .call(() => {
        if (onComplete) {
          onComplete();
        }
      })
      .start();
  }

  handleNodeVisibility(active: boolean): void {
    this.node.active = active;
  }

  private updateBuildingDetails(building: IBuildingInfo): void {
    this.labelPanelTitle!.string = building.name;
    this.labelPanelDesc!.string = building.description;
  }

  private createSummonQueueFrames(): void {
    this.layoutSummonQueue!.node.removeAllChildren();

    const queueSize = this._towerViewModel?.getMaxHireSlots() || 0;

    for (let i = 0; i < queueSize; i++) {
      this.instantiateSummonHero();
    }
  }

  private instantiateSummonHero() {
    if (!this.prefabSummonHero) {
      warn("TowerView instantiateSummonHero(): prefabSummonHero is null");
      return;
    }

    const summonHeroNode: Node = instantiate(this.prefabSummonHero);
    this.layoutSummonQueue!.node.addChild(summonHeroNode);
  }

  private renderSummonQueueHeroes(summonQueue: IHero[]): void {
    if (this.layoutSummonQueue === null) {
      warn("TowerView.renderSummonQueueHeroes() layoutSummonQueue is null");
      return;
    }

    const children = this.layoutSummonQueue.node.children;
    const queueSize = summonQueue.length;

    children.forEach((node, i) => {
      this.updateSummonHeroDetails(node, i < queueSize ? summonQueue[i] : null, i === 0);
    });

    this.towerViewModel?.checkSummonHero();

    // * CASE: if queue was full and just made a place & hero was selected
    if (queueSize === children.length - 1) {
      const selectedHero = this.towerViewModel?.getSelectedHero();
      if (selectedHero) {
        this.onHeroSelect(selectedHero);
      }
    }
  }

  private updateSummonHeroDetails(summonHeroNode: Node, hero: Nullable<IHero>, canSummon: boolean = false): void {
    const summonHeroView = summonHeroNode.getComponent(SummonHeroView);

    if (summonHeroView) {
      const summonHeroViewModel = summonHeroView.getViewModel();
      if (summonHeroViewModel) {
        hero ? summonHeroViewModel.setHeroData(hero, canSummon) : summonHeroViewModel.resetHeroData();
      }
    }
  }

  private updateHeroesList(heroes: IHero[]) {
    heroes.forEach(this.instantiateHero, this);
  }

  private instantiateHero(hero: IHero) {
    if (!this.prefabHero) {
      warn("TowerView instantiateHero(): prefabHero is null");
      return;
    }

    const heroNode: Node = instantiate(this.prefabHero);
    const heroView = heroNode.getComponent(HeroView);

    if (heroView) {
      const heroViewModel = new HeroViewModel(hero);
      heroView.setViewModel(heroViewModel);
    }
    this.layoutHeroesList!.node.addChild(heroNode);
  }

  private resetUI(): void {
    this.labelPanelTitle!.string = "";
    this.labelPanelDesc!.string = "";
    this.layoutSummonQueue!.node.removeAllChildren();
    this.layoutHeroesList!.node.removeAllChildren();
    this.resetHireButton();

    this.node.setPosition(Vec3.ZERO); // place node in center of screen
    this.towerPanelNode?.setPosition(this.getPanelTargetPos(true));
    this.handleNodeVisibility(false);
  }

  private resetHireButton(): void {
    this.updateHireButton(false);
  }

  private updateHireButton(activate: boolean, cost: number = -1): void {
    if (this.buttonHire === null) {
      return;
    }

    const canHire = this.towerViewModel.canHireHero(cost);
    const enable = activate && canHire;

    // button touch & opacity
    this.buttonHire.interactable = enable;
    const opacityComp = this.buttonHire.getComponent(UIOpacity);
    if (opacityComp) {
      opacityComp.opacity = enable ? 255 : 150;
    }

    // currency details
    this.spriteHireCurrency!.node.active = activate;
    this.labelHireCost!.string = cost > -1 ? cost.toString() : "";
    this.labelHireCost!.color = canHire ? Color.GREEN : Color.RED;

    // touch listener
    this.enableHireButtonTouchListener(enable);
  }

  /// Event Listeners
  private enableHireButtonTouchListener(enable: boolean) {
    if (enable) {
      this.buttonHire?.node.on(Input.EventType.TOUCH_END, this.onHireButtonClicked, this);
    } else {
      this.buttonHire?.node.off(Input.EventType.TOUCH_END, this.onHireButtonClicked, this);
    }
  }

  private onHireButtonClicked(event: EventTouch): void {
    event.propagationStopped = true;

    // hire hero
    this._towerViewModel?.hireHero();
  }

  private onBlockTouchNodeClick(event: EventTouch): void {
    /** this is only called if clicked outside panel
     * added BlockInputEvents comp which blocks all events to lower layers
     * event.propagationStopped = true not required */
    this._towerViewModel?.clickedOutOfPanel();
  }

  private onTowerPanelNodeClick(event: EventTouch): void {
    // block event to blockTouchNode, prevents closing of panel
    event.propagationStopped = true;
  }

  /// Helper Methods
  private getPanelTargetPos(slideOut: boolean = false): Vec3 {
    if (this.towerPanelNode === null) {
      warn("TowerView towerPanelNode is null");
      return Vec3.ZERO;
    }

    const gameHeight = view.getVisibleSize().height;
    const transform = this.towerPanelNode?.getComponent(UITransform);

    // bottom of screen wrt parent - if you change parentY panel should still be at bottom
    const bottomY = (gameHeight * 0.5 + this.node.position.y) * -1;
    let targetPosY = bottomY;

    if (transform) {
      targetPosY += transform.height * transform.anchorY * (slideOut ? -1 : 1);
    }
    return new Vec3(0, targetPosY, 0);
  }
}
