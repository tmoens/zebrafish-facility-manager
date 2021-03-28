import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {AppStateService} from "../app-state.service";
import {AuthService} from "./auth.service";

@Directive({
  selector: '[zfmHideUnauthorized]'
})
export class HideUnauthorizedDirective {
  @Input('zfmHideUnauthorized') requiredRole: string;

  constructor(
    private el: ElementRef,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    if (!this.authService.canPerformRole(this.requiredRole)) {
      // this.el.nativeElement.style.display = 'none';
      // for debugging, highlight disallowed light red
      this.el.nativeElement.style.display = '#ff9989';
    } else {
      // for debugging highlight allowed light green
      this.el.nativeElement.style.backgroundColor = '#b5ffb5'
    }
  }
}
