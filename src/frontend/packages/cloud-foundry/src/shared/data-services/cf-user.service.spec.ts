import { inject, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { SharedModule } from '../../../../core/src/shared/shared.module';
import {
  generateCfStoreModules,
  generateTestCfEndpointServiceProvider,
} from '../../../../core/test-framework/cloud-foundry-endpoint-service.helper';
import { CfUserService } from './cf-user.service';

describe('CfUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        generateCfStoreModules(),
        HttpModule
      ],
      providers: [
        ...generateTestCfEndpointServiceProvider()
      ]
    });
  });

  it('should be created', inject([CfUserService], (service: CfUserService) => {
    expect(service).toBeTruthy();
  }));
});
