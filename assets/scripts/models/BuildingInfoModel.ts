import { IBuildingInfo } from "../common/types";

export default class BuildingInfoModel implements IBuildingInfo {
  public id: string;
  public name: string;
  public description: string;
  public hireSlots: number;
  constructor(data: IBuildingInfo) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.hireSlots = data.hireSlots;
  }
}
