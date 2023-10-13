import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClusterComponent } from './create-cluster.component';

describe('CreateClusterComponent', () => {
  let component: CreateClusterComponent;
  let fixture: ComponentFixture<CreateClusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateClusterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
