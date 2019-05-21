import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { AppState } from '../../../../store/src/app-state';
import { endpointSchemaKey, organizationSchemaKey, spaceSchemaKey } from '../../../../store/src/helpers/entity-factory';
import { selectEntity } from '../../../../store/src/selectors/api.selectors';
import { APIResource } from '../../../../store/src/types/api.types';
import { EndpointModel } from '../../../../store/src/types/endpoint.types';
import { IOrganization, ISpace } from '../../core/cf-api.types';
import { haveMultiConnectedCfs } from '../../features/cloud-foundry/cf.helpers';
import { EntityCatalogueHelpers } from '../../core/entity-catalogue/entity-catalogue.helper';
import { CF_ENDPOINT_TYPE } from '../../../../cloud-foundry/cf-types';
import { STRATOS_ENDPOINT_TYPE } from '../../base-entity-schemas';

export class CfOrgSpaceLabelService {

  public multipleConnectedEndpoints$: Observable<boolean>;
  private cf$: Observable<EndpointModel>;
  private org$: Observable<APIResource<IOrganization>>;
  private space$: Observable<APIResource<ISpace>>;

  /**
   * @param cfGuid Only important if using getValue
   * @param orgGuid Only important if using getValue
   * @param spaceGuid Only important if using getValue
   */
  constructor(
    private store: Store<AppState>,
    private cfGuid?: string,
    private orgGuid?: string,
    private spaceGuid?: string) {
    this.multipleConnectedEndpoints$ = haveMultiConnectedCfs(this.store);
    const orgEntityKey = EntityCatalogueHelpers.buildEntityKey(organizationSchemaKey, CF_ENDPOINT_TYPE);
    const spaceEntityKey = EntityCatalogueHelpers.buildEntityKey(spaceSchemaKey, CF_ENDPOINT_TYPE);
    // TODO We shouldn't have to expose STRATOS_ENDPOINT_TYPE - I'm not sure about that anymore, that's up to the extension.
    const endpointEntityKey = EntityCatalogueHelpers.buildEntityKey(endpointSchemaKey, STRATOS_ENDPOINT_TYPE);

    this.cf$ = this.store.select<EndpointModel>(selectEntity(endpointEntityKey, this.cfGuid));

    this.org$ = this.store.select<APIResource<IOrganization>>(selectEntity(orgEntityKey, this.orgGuid));
    this.space$ = this.store.select<APIResource<ISpace>>(selectEntity(spaceEntityKey, this.spaceGuid));
  }

  getLabel(): Observable<string> {
    return this.multipleConnectedEndpoints$.pipe(
      map(multipleConnectedEndpoints => multipleConnectedEndpoints ? 'CF/Org/Space' : 'Org/Space')
    );
  }

  getValue(): Observable<string> {
    return combineLatest(
      this.cf$,
      this.org$,
      this.space$,
      this.multipleConnectedEndpoints$
    ).pipe(
      filter(([cf, org, space]) => !!cf && !!org && !!space),
      first(),
      map(([cf, org, space, multipleConnectedEndpoints]) =>
        multipleConnectedEndpoints ? `${cf.name}/${org.entity.name}/${space.entity.name}` : `${org.entity.name}/${space.entity.name}`
      )
    );
  }

  getCfURL = () => ['/cloud-foundry', this.cfGuid, 'summary'];
  getCfName = () => this.cf$.pipe(map(cf => cf ? cf.name : ''));

  getOrgURL = () => ['/cloud-foundry', this.cfGuid, 'organizations', this.orgGuid, 'summary'];
  getOrgName = () => this.org$.pipe(map(org => org ? org.entity.name : ''));

  getSpaceURL = () => ['/cloud-foundry', this.cfGuid, 'organizations', this.orgGuid, 'spaces', this.spaceGuid, 'summary'];
  getSpaceName = () => this.space$.pipe(map(space => space ? space.entity.name : ''));
}
