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
      this.el.nativeElement.style.display = 'none';
    } else {
      // this makes things nice and clear if you need to debug.
      // this.el.nativeElement.style.backgroundColor = 'yellow'
    }
  }
}
