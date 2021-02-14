import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {UserViewerComponent} from './user-viewer.component';

describe('UserViewerComponent', () => {
  let component: UserViewerComponent;
  let fixture: ComponentFixture<UserViewerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserViewerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
