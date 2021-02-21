import {TankLabelConfig} from '../printing/tank-label/tank-label-config';
import {LabelPrintingConfig} from '../printing/label-printing-config';

// This is the configuration information associated with a particular zebrafish facility
// The defaults provided should be overridden in the "per facility" config file in
// the facility-config directory

export class ConfigModel {
  facilityName = 'TBD';
  facilityAbbrv = 'TBD';

  hidePI = false;

  tankNumberingHint: string = 'No tank numbering hint available'

  labelPrintingDefaults: LabelPrintingConfig = new LabelPrintingConfig();

  tankLabelLayoutDefaults: TankLabelConfig = new TankLabelConfig();
}
