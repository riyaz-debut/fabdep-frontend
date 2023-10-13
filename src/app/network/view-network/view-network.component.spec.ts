import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNetworkComponent } from './view-network.component';

describe('ViewNetworkComponent', () => {
  let component: ViewNetworkComponent;
  let fixture: ComponentFixture<ViewNetworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewNetworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
