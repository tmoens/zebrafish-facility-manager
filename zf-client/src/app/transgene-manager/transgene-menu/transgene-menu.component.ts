import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {TransgeneService} from '../transgene.service';

@Component({
  selector: 'app-transgene-menu',
  templateUrl: './transgene-menu.component.html',
  styleUrls: ['./transgene-menu.component.scss']
})

export class TransgeneMenuComponent implements OnInit {

  constructor(
    private router: Router,
    public service: TransgeneService,
  ) {
  }

  ngOnInit() {
  }

  create() {
    this.router.navigate(['transgene_manager/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }

  createNext() {
    this.router.navigate(['transgene_manager/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }
}


