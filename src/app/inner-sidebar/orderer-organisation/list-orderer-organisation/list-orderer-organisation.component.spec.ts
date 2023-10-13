import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOrdererOrganisationComponent } from './list-orderer-organisation.component';

describe('ListOrdererOrganisationComponent', () => {
  let component: ListOrdererOrganisationComponent;
  let fixture: ComponentFixture<ListOrdererOrganisationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListOrdererOrganisationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOrdererOrganisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
