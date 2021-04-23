import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwimmerEditorComponent } from './swimmer-editor.component';

describe('SwimmerEditorComponent', () => {
  let component: SwimmerEditorComponent;
  let fixture: ComponentFixture<SwimmerEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwimmerEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwimmerEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
