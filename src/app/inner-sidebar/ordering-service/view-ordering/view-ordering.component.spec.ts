import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrderingComponent } from './view-ordering.component';

describe('ViewOrderingComponent', () => {
  let component: ViewOrderingComponent;
  let fixture: ComponentFixture<ViewOrderingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOrderingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
