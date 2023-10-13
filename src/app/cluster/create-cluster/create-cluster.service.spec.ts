import { TestBed } from '@angular/core/testing';

import { CreateClusterService } from './create-cluster.service';

describe('CreateClusterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateClusterService = TestBed.get(CreateClusterService);
    expect(service).toBeTruthy();
  });
});
