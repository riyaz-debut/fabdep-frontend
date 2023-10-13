import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaListComponent } from './ca-list.component';

describe('CaListComponent', () => {
  let component: CaListComponent;
  let fixture: ComponentFixture<CaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
