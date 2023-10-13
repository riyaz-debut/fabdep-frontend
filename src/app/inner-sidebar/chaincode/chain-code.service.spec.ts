import { TestBed } from '@angular/core/testing';

import { ChainCodeService } from './chain-code.service';

describe('ChainCodeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChainCodeService = TestBed.get(ChainCodeService);
    expect(service).toBeTruthy();
  });
});
