import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CrossLabelComponent} from './cross-label.component';

describe('CrossLabelComponent', () => {
  let component: CrossLabelComponent;
  let fixture: ComponentFixture<CrossLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrossLabelComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
