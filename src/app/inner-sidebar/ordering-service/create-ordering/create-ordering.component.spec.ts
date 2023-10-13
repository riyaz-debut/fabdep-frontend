import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrderingComponent } from './create-ordering.component';

describe('CreateOrderingComponent', () => {
  let component: CreateOrderingComponent;
  let fixture: ComponentFixture<CreateOrderingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOrderingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
