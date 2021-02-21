import {TankLabelConfig} from '../printing/tank-label/tank-label';

// This is the configuration information associated with a particular zebrafish facility
// The defaults provided should be overridden in the "per facility" config file in
// the facility-config directory

export class ConfigModel {
  facilityName = 'TBD';
  facilityAbbrv = 'TBD';
  facilityPrefix = 'XXX';

  hidePI = false;

  tankNumberingHint: string = 'No tank numbering hint available'
  tankLabelConfig: TankLabelConfig = new TankLabelConfig();
}
