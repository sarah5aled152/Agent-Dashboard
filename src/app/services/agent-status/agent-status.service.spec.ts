import { TestBed } from '@angular/core/testing';

import { AgentStatusService } from './agent-status.service';

describe('AgentStatusService', () => {
  let service: AgentStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
