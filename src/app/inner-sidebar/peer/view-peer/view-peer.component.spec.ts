import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPeerComponent } from './view-peer.component';

describe('ViewPeerComponent', () => {
  let component: ViewPeerComponent;
  let fixture: ComponentFixture<ViewPeerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPeerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPeerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
