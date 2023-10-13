import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashScreereenComponent } from './splash-screereen.component';

describe('SplashScreereenComponent', () => {
  let component: SplashScreereenComponent;
  let fixture: ComponentFixture<SplashScreereenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplashScreereenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplashScreereenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
