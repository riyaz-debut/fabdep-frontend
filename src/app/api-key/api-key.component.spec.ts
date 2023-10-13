import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { APIKeyComponent } from './api-key.component';

describe('APIKeyComponent', () => {
  let component: APIKeyComponent;
  let fixture: ComponentFixture<APIKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ APIKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(APIKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
