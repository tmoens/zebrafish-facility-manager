import {Component, OnInit} from '@angular/core';
import {MutationService} from '../mutation.service';
import {Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {ZFTool} from "../../helpers/zf-tool";

@Component({
  selector: 'app-mutation-menu',
  templateUrl: './mutation-menu.component.html',
  styleUrls: ['./mutation-menu.component.scss']
})

export class MutationMenuComponent implements OnInit {

  constructor(
    private router: Router,
    public service: MutationService,
  ) {
  }

  ngOnInit() {
  }

  create() {
    this.router.navigate([ZFTool.MUTATION_MANAGER.route + '/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }

  createNext() {
    this.router.navigate([ZFTool.MUTATION_MANAGER.route + '/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }

  edit() {
    this.router.navigate([ZFTool.MUTATION_MANAGER.route + '/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

  delete() {
    this.service.delete(this.service.selected.id);
  }


  goToBestPractices(): void {
    window.open('https://zebrafishfacilitymanager.com/mutations');
  }

}


