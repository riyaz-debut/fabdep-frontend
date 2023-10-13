import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrdererOrganisationComponent } from './view-orderer-organisation.component';

describe('ViewOrdererOrganisationComponent', () => {
  let component: ViewOrdererOrganisationComponent;
  let fixture: ComponentFixture<ViewOrdererOrganisationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOrdererOrganisationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOrdererOrganisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
