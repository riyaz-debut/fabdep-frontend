import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClusterComponent } from './view-cluster.component';

describe('ViewClusterComponent', () => {
  let component: ViewClusterComponent;
  let fixture: ComponentFixture<ViewClusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewClusterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
