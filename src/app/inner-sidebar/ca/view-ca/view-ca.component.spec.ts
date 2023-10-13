import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCaComponent } from './view-ca.component';

describe('ViewCaComponent', () => {
  let component: ViewCaComponent;
  let fixture: ComponentFixture<ViewCaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
