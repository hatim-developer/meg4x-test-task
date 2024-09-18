import {
  _decorator,
  Button,
  Component,
  EventTouch,
  Input,
  instantiate,
  Node,
  Layout,
  log,
  Prefab,
  warn,
  Label,
  UITransform,
  Vec3,
  view,
  tween
} from "cc";
import { IHero, Nullable } from "../common/types";
import { HeroesDetailsUIViewModel } from "../viewmodels/HeroesDetailsUIViewModel";
import { Subscription } from "rxjs";
import { HeroDetailsContainerView } from "./HeroDetailsContainerView";
import { HeroDetailsContainerViewModel } from "../viewmodels/HeroDetailsContainerViewModel";
const { ccclass, property } = _decorator;

@ccclass("HeroesDetailsUIView")
export class HeroesDetailsUIView extends Component {
  private _heroesDetailsUIViewModel?: HeroesDetailsUIViewModel;
  private _subscription: Subscription[] = [];

  @property({
    type: Button
  })
  public buttonClose: Nullable<Button> = null;

  @property({
    type: Layout
  })
  public layoutContent: Nullable<Layout> = null;

  @property({
    type: Prefab
  })
  public prefabHeroContainer: Nullable<Prefab> = null;

  @property({
    type: Label
  })
  public labelInfo: Nullable<Label> = null;

  @property({
    type: Node
  })
  public panelNode: Nullable<Node> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    // * instantiate CurrencyVM
    this._heroesDetailsUIViewModel = new HeroesDetailsUIViewModel();
    this._subscription = [];

    this.resetUI();
    this.subscribeEvents();
  }

  start() {
    this.buttonClose?.node.on(Input.EventType.TOUCH_END, this.onCloseButtonClick, this);
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription.forEach((sub) => sub.unsubscribe);

    this.buttonClose?.node.off(Input.EventType.TOUCH_END, this.onCloseButtonClick, this);
  }

  /// Subscriptions
  private subscribeEvents(): void {
    if (!this._heroesDetailsUIViewModel) {
      return;
    }

    const activatePanelSub = this._heroesDetailsUIViewModel.getActivateHallOfHeroesObservable().subscribe((show) => {
      this.onPanelUIRequest(show);
    });

    const herosDetailsSub = this._heroesDetailsUIViewModel.getPlayerHeroesObservable().subscribe((heroes) => {
      this.onHeroesStateChange(heroes);
    });

    // * save subscriptions for cleaning
    this._subscription.push(activatePanelSub, herosDetailsSub);
  }

  /// UI Methods
  private onPanelUIRequest(show: boolean) {
    if (show) {
      this.showDetailsPanel();
    } else {
      this.closeDetailsPanel();
    }
  }
  private showDetailsPanel(): void {
    // activate node first
    this.handleNodeVisibility(true);

    if (this.panelNode) {
      this.startSlideAnimation(this.panelNode, this.getPanelTargetPos(), () => {
        this.handleNodeVisibility(true);
      });
    }
  }

  private closeDetailsPanel(): void {
    if (this.panelNode) {
      this.startSlideAnimation(this.panelNode, this.getPanelTargetPos(true), () => {
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
    log("HeroDetailsUIView handleNodeVisibility() node active:", active); // !_DEBUG_
    this.node.active = active;
  }

  private onHeroesStateChange(heroes: IHero[]) {
    log("HeroesDetailsUIView onHeroesStateChange()"); // !_DEBUG
    this.updateHeroesList(heroes);
  }

  private resetUI(): void {
    this.layoutContent!.node.removeAllChildren();

    if (this.labelInfo) {
      this.labelInfo.node.active = true;
    }

    this.node.setPosition(Vec3.ZERO); // place node in center of screen
    this.panelNode?.setPosition(this.getPanelTargetPos(true));
    this.handleNodeVisibility(false);
  }

  private updateHeroesList(heroes: IHero[]) {
    if (this.layoutContent === null) {
      warn("HeroesDetailsUIView updateHeroesList(): layoutContent is null");
      return;
    }

    const heroesLen = heroes.length;
    const childrenLen = this.layoutContent.node.children.length;

    // CASE: if empty heroes list removing all children
    if (heroesLen === 0) {
      if (childrenLen) {
        warn("HeroesDetailsUIView updateHeroesList(): you cleared all player heroes are you sure? ignore if intentional");
        this.resetUI();
      }
      return;
    }

    if (this.labelInfo) {
      this.labelInfo.node.active = false;
    }

    // update only new heroes
    for (let i = childrenLen; i < heroesLen; i++) {
      this.instantiateHeroContainer(heroes[i]);
    }
  }

  private instantiateHeroContainer(hero: IHero): void {
    if (!this.prefabHeroContainer) {
      warn("HeroesDetailsUIView instantiateHeroContainer(): prefabHeroContainer is null");
      return;
    }

    const heroNode: Node = instantiate(this.prefabHeroContainer);
    const heroView = heroNode.getComponent(HeroDetailsContainerView);

    if (heroView) {
      const heroViewModel = new HeroDetailsContainerViewModel(hero);
      heroView.setViewModel(heroViewModel);
    }
    this.layoutContent!.node.addChild(heroNode);
  }

  /// Event Listeners
  private onCloseButtonClick(event: EventTouch): void {
    event.propagationStopped = true;
    log("HeroesDetailsUIView onCloseButtonClick()"); // !_DEBUG

    this._heroesDetailsUIViewModel?.closeButtonClick();
  }

  /// Helper Methods
  private getPanelTargetPos(slideOut: boolean = false): Vec3 {
    if (this.panelNode === null) {
      warn("HeroDetailsUIView panelNode is null");
      return Vec3.ZERO;
    }

    const gameHeight = view.getVisibleSize().height;
    const transform = this.panelNode?.getComponent(UITransform);

    // center of screen wrt parent - if you change parentY panel should still slide in at center
    let targetPosY = this.node.position.y * -1; // center

    if (transform && slideOut) {
      // top + panel height position
      targetPosY = gameHeight * 0.5 + this.node.position.y;
      targetPosY += transform.height * transform.anchorY;
    }
    return new Vec3(0, targetPosY, 0);
  }
}
