import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrdererOrganisationComponent } from './edit-orderer-organisation.component';

describe('EditOrdererOrganisationComponent', () => {
  let component: EditOrdererOrganisationComponent;
  let fixture: ComponentFixture<EditOrdererOrganisationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOrdererOrganisationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOrdererOrganisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
