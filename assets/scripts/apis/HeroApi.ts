import { JsonAsset, resources } from "cc";
import { Observable } from "rxjs";

export const fetchHeroList = () => {
  return new Observable<[]>((subscriber) => {
    resources.load("/settings/heroes", JsonAsset, (err, resp) => {
      if (err) {
        subscriber.error(err);
        return;
      }

      const data = resp.json;

      if (data && data.heroes) {
        subscriber.next(data.heroes);
        subscriber.complete();
      }

      subscriber.error(new Error("custom_error: Heroes List data not found"));
    });
  });
};
