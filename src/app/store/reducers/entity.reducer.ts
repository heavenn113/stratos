import { RequestMethod } from '@angular/http';

import { ApiActionTypes } from './../actions/api.actions';
import { mergeState } from './../helpers/reducer.helper';
import { WrapperAPIActionSuccess } from '../types/api.types';

export interface EntitiesState {
  application: any;
  stack: any;
  space: any;
  organization: any;
  route: any;
  event: any;
}

export const defaultEntitiesState = {
  application: {},
  stack: {},
  space: {},
  organization: {},
  route: {},
  event: {}
};

export function entitiesReducer(state: EntitiesState = defaultEntitiesState, action: WrapperAPIActionSuccess) {
  switch (action.apiType) {
    case ApiActionTypes.API_REQUEST_SUCCESS:
      if (action.apiAction.options.method === 'delete' || action.apiAction.options.method === RequestMethod.Delete) {
        const newState = { ...state };
        delete newState[action.apiAction.entityKey][action.apiAction.guid];
        return newState;
      }
      return mergeState(state, action.response.entities);
    default:
      return state;
  }
}

