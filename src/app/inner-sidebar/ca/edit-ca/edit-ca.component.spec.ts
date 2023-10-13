import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCaComponent } from './edit-ca.component';

describe('EditCaComponent', () => {
  let component: EditCaComponent;
  let fixture: ComponentFixture<EditCaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
