import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { CoreModule } from '../../../../../../../../core/src/core/core.module';
import {
  ServicePlanPublicComponent,
} from '../../../../../../../../core/src/shared/components/service-plan-public/service-plan-public.component';
import { EntityMonitorFactory } from '../../../../../../../../core/src/shared/monitors/entity-monitor.factory.service';
import { generateCfStoreModules } from '../../../../../../../../core/test-framework/cloud-foundry-endpoint-service.helper';
import { ServicesService } from '../../../../../../features/service-catalog/services.service';
import { ServicesServiceMock } from '../../../../../../features/service-catalog/services.service.mock';
import { TableCellAServicePlanPublicComponent } from './table-cell-service-plan-public.component';

describe('TableCellAServicePlanPublicComponent', () => {
  let component: TableCellAServicePlanPublicComponent;
  let fixture: ComponentFixture<TableCellAServicePlanPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TableCellAServicePlanPublicComponent,
        ServicePlanPublicComponent
      ],
      imports: [
        StoreModule,
        CoreModule,
        generateCfStoreModules()
      ],
      providers: [
        EntityMonitorFactory,
        { provide: ServicesService, useClass: ServicesServiceMock },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellAServicePlanPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
