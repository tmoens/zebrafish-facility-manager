import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ZfSelectorListComponent} from './zf-selector-list.component';

describe('ZfSelectorListComponent', () => {
  let component: ZfSelectorListComponent;
  let fixture: ComponentFixture<ZfSelectorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZfSelectorListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZfSelectorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
