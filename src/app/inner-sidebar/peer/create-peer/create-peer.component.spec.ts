import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePeerComponent } from './create-peer.component';

describe('CreatePeerComponent', () => {
  let component: CreatePeerComponent;
  let fixture: ComponentFixture<CreatePeerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePeerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePeerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
