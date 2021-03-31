import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TransgeneService} from '../transgene.service';
import {AbstractControl, FormBuilder} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {TransgeneFilter} from '../transgene-filter';
import {Router} from '@angular/router';
import {TransgeneDto} from "../transgene-dto";
import {AppStateService} from "../../app-state.service";
import {ZfGenericDto} from "../../zf-generic/zfgeneric-dto";
import {ZFTool} from '../../helpers/zf-tool';

@Component({
  selector: 'app-transgene-selector',
  templateUrl: 'transgene-selector.component.html',
})
export class TransgeneSelectorComponent implements OnInit {
  @Output() selected = new EventEmitter<TransgeneDto>();
  focusId: number;

  // Build the filter form.
  mfForm = this.fb.group(this.service.filter);


  constructor(
    public appState: AppStateService,
    private router: Router,
    private fb: FormBuilder,
    public service: TransgeneService,
  ) { }

  ngOnInit() {
    // any time a filter value changes, reapply the filter.
    this.mfForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.service.setFilter(new TransgeneFilter(this.mfForm.value));
      this.service.applyFilter();
    });
  }

  getFC(name: string): AbstractControl {
    return this.mfForm.get(name);
  }

  clearFormControl(name: string) {
    this.getFC(name).setValue(''); // which will cause the filter to reapply.
  }

  // when the user clicks on a transgene,
  // a) emit an event.  Right now the only consumer of this event is the containing sidenav.
  //    If the selector is toggled open (as opposed to being fixed in place), it needs to
  //    toggle itself closed before
  // b) navigate to view the selected transgene
  onSelect(instance: ZfGenericDto | null) {
    this.focusId = instance.id;
    this.selected.emit(instance as TransgeneDto);
    this.router.navigate([ZFTool.TRANSGENE_MANAGER.route + '/view/' + instance.id]).then();
  }

  onPreselect(id) {
    this.focusId = id;
  }
}
