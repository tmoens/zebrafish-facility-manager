import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {AppStateService} from "../app-state.service";

@Directive({
  selector: '[zfmHideUnauthorized]'
})
export class HideUnauthorizedDirective {
  @Input('zfmHideUnauthorized') requiredRole: string;

  constructor(
    private el: ElementRef,
    private appStateService: AppStateService
  ) {
  }

  ngOnInit() {
    console.log('made it in the hide unauthorized directive. required role: ' + this.requiredRole);
    if (!this.appStateService.canPerformRole(this.requiredRole)) {
      this.el.nativeElement.style.display = 'none';
    } else {
      // this makes things nice and clear if you need to debug.
      // this.el.nativeElement.style.backgroundColor = 'yellow'
    }
  }
}
