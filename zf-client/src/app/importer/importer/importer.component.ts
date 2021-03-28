import { Component, OnInit } from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {ZFTool} from '../../helpers/zf-tool';
import {ZFTypes} from '../../helpers/zf-types';

@Component({
  selector: 'app-importer',
  template: `
    <p>
      importer works!
    </p>
  `,
  styleUrls: ['./importer.component.scss']
})
export class ImporterComponent implements OnInit {
  typeToImport: ZFTypes;

  constructor(
    public appState: AppStateService,
  ) { }

  ngOnInit(): void {
    this.appState.setActiveTool(ZFTool.IMPORT_TOOL);
  }

}
