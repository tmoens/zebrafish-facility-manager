import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ZfDetailListComponent} from './zf-detail-list.component';

describe('ZfDetailListComponent', () => {
  let component: ZfDetailListComponent;
  let fixture: ComponentFixture<ZfDetailListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZfDetailListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZfDetailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
