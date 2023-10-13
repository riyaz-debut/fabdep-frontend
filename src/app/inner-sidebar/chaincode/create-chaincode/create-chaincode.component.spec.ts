import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChaincodeComponent } from './create-chaincode.component';

describe('CreateChaincodeComponent', () => {
  let component: CreateChaincodeComponent;
  let fixture: ComponentFixture<CreateChaincodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateChaincodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateChaincodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
