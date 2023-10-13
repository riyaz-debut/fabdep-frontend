import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrderingComponent } from './edit-ordering.component';

describe('EditOrderingComponent', () => {
  let component: EditOrderingComponent;
  let fixture: ComponentFixture<EditOrderingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOrderingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
