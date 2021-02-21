import {LabelPrintingConfig} from '../label-printing-config';
import {TankLabelConfig} from './tank-label-config';
import {classToClass} from 'class-transformer';
import {ConfigModel} from '../../config/config-model';

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
    private facilityConfig: ConfigModel,
  ) {
    this.printConfig = classToClass(this.facilityConfig.labelPrintingDefaults);
    this.layoutConfig = classToClass(this.facilityConfig.tankLabelLayoutDefaults)
  }

}
