import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChaincodeComponent } from './view-chaincode.component';

describe('ViewChaincodeComponent', () => {
  let component: ViewChaincodeComponent;
  let fixture: ComponentFixture<ViewChaincodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewChaincodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewChaincodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
