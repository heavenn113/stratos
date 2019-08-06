import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../../../../core/src/core/core.module';
import { SharedModule } from '../../../../../../core/src/shared/shared.module';
import { generateCfStoreModules } from '../../../../../../core/test-framework/cloud-foundry-endpoint-service.helper';
import { CommitListWrapperComponent } from './commit-list-wrapper/commit-list-wrapper.component';
import { DeployApplicationStep21Component } from './deploy-application-step2-1.component';

describe('DeployApplicationStep21Component', () => {
  let component: DeployApplicationStep21Component;
  let fixture: ComponentFixture<DeployApplicationStep21Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DeployApplicationStep21Component,
        CommitListWrapperComponent
      ],
      imports: [
        CoreModule,
        SharedModule,
        generateCfStoreModules()
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployApplicationStep21Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
