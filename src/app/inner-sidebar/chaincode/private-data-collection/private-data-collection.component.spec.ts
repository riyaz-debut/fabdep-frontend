import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateDataCollectionComponent } from './private-data-collection.component';

describe('PrivateDataCollectionComponent', () => {
  let component: PrivateDataCollectionComponent;
  let fixture: ComponentFixture<PrivateDataCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateDataCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateDataCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
