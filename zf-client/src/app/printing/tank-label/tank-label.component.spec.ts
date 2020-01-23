import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TankLabelComponent } from './tank-label.component';

describe('TankLabelComponent', () => {
  let component: TankLabelComponent;
  let fixture: ComponentFixture<TankLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TankLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TankLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
