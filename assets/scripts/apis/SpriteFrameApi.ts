import { SpriteFrame, resources } from "cc";
import { Observable } from "rxjs";

export const fetchSpriteFrame = (path: string) => {
  return new Observable<SpriteFrame>((subscriber) => {
    resources.load(path + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
      if (err) {
        subscriber.error(err);
        return;
      }

      subscriber.next(spriteFrame);
      subscriber.complete();
    });
  });
};

export const fetchAllSpriteFrames = (pathArr: string[]) => {
  return pathArr.map((path) => {
    return fetchSpriteFrame(path);
  });
};
