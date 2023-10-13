import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkClusterListComponent } from './network-cluster-list.component';


describe('NetworkClusterLirListComponent', () => {
  let component: NetworkClusterListComponent;
  let fixture: ComponentFixture<NetworkClusterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkClusterListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkClusterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
