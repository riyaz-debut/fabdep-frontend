import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCaComponent } from './create-ca.component';

describe('CreateCaComponent', () => {
  let component: CreateCaComponent;
  let fixture: ComponentFixture<CreateCaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
