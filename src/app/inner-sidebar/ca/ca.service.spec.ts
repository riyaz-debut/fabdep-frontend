import { TestBed } from '@angular/core/testing';

import { CaService } from './ca.service';

describe('CaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CaService = TestBed.get(CaService);
    expect(service).toBeTruthy();
  });
});
