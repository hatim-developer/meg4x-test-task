import { _decorator, Color, Component, Label, tween, Vec3, warn } from "cc";
import { Nullable } from "../common/types";
import { CurrencyViewModel } from "../viewmodels/CurrencyViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("CurrencyView")
export class CurrencyView extends Component {
  private _currencyViewModel?: CurrencyViewModel;
  private _subscription?: Subscription;

  @property({
    type: Label
  })
  public labelCurrency: Nullable<Label> = null;

  @property({
    type: Label
  })
  public labelAnimated: Nullable<Label> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    // * instantiate CurrencyVM
    this._currencyViewModel = new CurrencyViewModel();
    this.resetUI();
  }

  start() {
    this.subscribeEvents();
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription?.unsubscribe();
  }

  /// Subscriptions
  private subscribeEvents(): void {
    this._subscription = this._currencyViewModel?.getCurrencyObservable().subscribe((currency) => {
      this.onCurrencyChange(currency);
    });
  }

  /// UI Methods
  private onCurrencyChange(newCurrency: number) {
    if (this.labelCurrency) {
      const currCurrency = parseInt(this.labelCurrency.string);
      this.labelCurrency.string = newCurrency.toString();

      // show currency anim
      this.startCurrencyAnimation(newCurrency, currCurrency);
    }
  }

  private resetUI(): void {
    this.resetAnimatedLabel();
  }
  private resetAnimatedLabel(): void {
    if (this.labelAnimated) {
      this.labelAnimated.string = "";
      this.labelAnimated.color = Color.WHITE;
      this.labelAnimated.node.active = false;
    }
  }

  /// Animation Methods
  startCurrencyAnimation(newAmount: number, currAmount: number) {
    if (!this.labelCurrency) {
      warn("CurrencyView missing labelCurrency");
      return;
    }

    const amountChange = newAmount - currAmount;

    // Animate the currency label
    this.animateLabel(amountChange);
  }

  animateLabel(amountChange: number) {
    if (!this.labelAnimated || isNaN(amountChange)) {
      return;
    }

    const normalScale = new Vec3(1, 1, 1);
    const animScale = new Vec3(1, 1, 1);
    let amountStr = amountChange.toString();

    this.labelAnimated.node.setScale(normalScale);
    this.labelAnimated.node.active = true;

    // color for currency action
    if (amountChange < 0) {
      this.labelAnimated.color = Color.RED; // deducted
    } else {
      this.labelAnimated.color = Color.GREEN; // credited
      amountStr = `+${amountStr}`;
    }
    this.labelAnimated.string = amountStr;

    // Tween scale anim
    tween(this.labelAnimated.node)
      .to(0.1, { scale: animScale }) // scale up
      .delay(0.2)
      .to(0.1, { scale: normalScale }) // scale back to normal
      .delay(0.2)
      .call(() => {
        this.resetAnimatedLabel();
      })
      .start();
  }
}
