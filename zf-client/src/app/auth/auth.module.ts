import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HideUnauthorizedDirective} from "./hide-unauthorized.directive";


@NgModule({
  declarations: [
    HideUnauthorizedDirective,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HideUnauthorizedDirective,
  ]

})
export class AuthModule {
}
