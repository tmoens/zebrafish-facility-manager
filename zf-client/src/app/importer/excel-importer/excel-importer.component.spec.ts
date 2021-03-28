import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelImporterComponent } from './excel-importer.component';

describe('ExcelImporterComponent', () => {
  let component: ExcelImporterComponent;
  let fixture: ComponentFixture<ExcelImporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcelImporterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
