import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CrossLabelMakerComponent} from './cross-label-maker.component';

describe('CrossLabelMakerComponent', () => {
  let component: CrossLabelMakerComponent;
  let fixture: ComponentFixture<CrossLabelMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrossLabelMakerComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossLabelMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
