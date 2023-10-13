import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrganisationComponent } from './view-organisation.component';

describe('ViewOrganisationComponent', () => {
  let component: ViewOrganisationComponent;
  let fixture: ComponentFixture<ViewOrganisationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOrganisationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOrganisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
