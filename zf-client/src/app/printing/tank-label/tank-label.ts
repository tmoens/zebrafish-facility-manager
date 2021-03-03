import {LabelPrintingConfig} from '../../common/config/label-printing-config';
import {TankLabelConfig} from '../../common/config/tank-label-config';
import {classToClass} from 'class-transformer';
import {ClientConfig} from '../../common/config/client-config';

export class TankLabel {
  printConfig: LabelPrintingConfig;
  layoutConfig: TankLabelConfig;
  stockUrl: string = null;
  name: string = null;
  piName: string = null;
  piInitials: string = null;
  researcherName: string = null;
  researcherInitials: string = null;
  fertilizationDate: string = null;
  description: string = null;
  mutations: string = null;
  transgenes: string = null;
  additionalNote: string = null;

  constructor(
    private facilityConfig: ClientConfig,
  ) {
    this.printConfig = classToClass(this.facilityConfig.labelPrinting);
    this.layoutConfig = classToClass(this.facilityConfig.tankLabel)
  }

}
