import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrdererOrganisationComponent } from './create-orderer-organisation.component';

describe('CreateOrdererOrganisationComponent', () => {
  let component: CreateOrdererOrganisationComponent;
  let fixture: ComponentFixture<CreateOrdererOrganisationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOrdererOrganisationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrdererOrganisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
