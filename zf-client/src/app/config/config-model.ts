import {TankLabelConfig} from "../printing/tank-label/tank-label";

// This is the configuration information associated with a particular zebrafish facility

export class ConfigModel {
  facilityName: string;
  facilityAbbrv: string;
  facilityPrefix: string;

  tankNumberingHint: string;
  tankLabelConfig: TankLabelConfig;
}
