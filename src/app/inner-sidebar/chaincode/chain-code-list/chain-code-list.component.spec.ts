import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainCodeListComponent } from './chain-code-list.component';

describe('ChainCodeListComponent', () => {
  let component: ChainCodeListComponent;
  let fixture: ComponentFixture<ChainCodeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainCodeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainCodeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
