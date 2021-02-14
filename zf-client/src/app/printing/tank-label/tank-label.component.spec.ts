import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {TankLabelComponent} from './tank-label.component';

describe('TankLabelComponent', () => {
  let component: TankLabelComponent;
  let fixture: ComponentFixture<TankLabelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TankLabelComponent]
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
