import { PaginatedAction, PaginationEntityState, PaginationParam, QParam } from '../types/pagination.types';
import { error } from 'util';
import { Action, Store } from '@ngrx/store';
import { denormalize, Schema } from 'normalizr';

import { ApiActionTypes } from '../actions/api.actions';
import {
  ADD_PARAMS,
  AddParams,
  CLEAR_PAGES,
  CLEAR_PAGINATION_OF_TYPE,
  REMOVE_PARAMS,
  RemoveParams,
  SET_PAGE,
  SET_PARAMS,
  SetPage,
  SetParams,
} from '../actions/pagination.actions';
import { AppState } from '../app-state';
import { getEntityState } from './../actions/api.actions';
import { mergeState } from './../helpers/reducer.helper';
import { Observable } from 'rxjs/Observable';
import { defaultEntitiesState, EntitiesState } from './entity.reducer';
import { selectPaginationState } from '../selectors/pagination.selectors';


export const resultPerPageParam = 'results-per-page';
export const resultPerPageParamDefault = 5;

export function qParamsToString(params: QParam[]) {
  const qStrings = params.map(joinQParam);
  return qStrings.join('%3A');
}

function joinQParam(q: QParam) {
  return `${q.key}${q.joiner}${(q.value as string[]).join ? (q.value as string[]).join(',') : q.value}`;
}

const types = [
  ApiActionTypes.API_REQUEST_START,
  ApiActionTypes.API_REQUEST_SUCCESS,
  ApiActionTypes.API_REQUEST_FAILED
];

const [requestType, successType, failureType] = types;

const defaultPaginationEntityState = {
  fetching: false,
  pageCount: 0,
  currentPage: 1,
  totalResults: 0,
  ids: {},
  params: {
    [resultPerPageParam]: resultPerPageParamDefault
  },
  error: false,
  message: ''
};

const updatePagination =
  function (state: PaginationEntityState = defaultPaginationEntityState, action, actionType): PaginationEntityState {
    switch (actionType) {
      case requestType:
        return {
          ...state,
          fetching: true,
          error: false,
          message: '',
        };
      case successType:
        const params = {};
        const { apiAction } = action;
        if (apiAction.options.params) {
          apiAction.options.params.paramsMap.forEach((value, key) => {
            const paramValue = value.length === 1 ? value[0] : value;
            params[key] = paramValue;
          });
        }
        return {
          ...state,
          fetching: false,
          error: false,
          message: '',
          ids: {
            ...state.ids,
            [state.currentPage]: action.response.result
          },
          pageCount: state.pageCount + 1,
          totalResults: action.totalResults || action.response.result.length
        };
      case failureType:
        return {
          ...state,
          fetching: false,
          error: true,
          message: action.message
        };
      case SET_PAGE:
        return {
          ...state,
          error: false,
          currentPage: (action as SetPage).pageNumber
        };
      case SET_PARAMS:

        return {
          ...state,
          params: removeEmptyParams({
            [resultPerPageParam]: resultPerPageParamDefault,
            ...(action as SetParams).params,
            q: getUniqueQParams(action as SetParams, state)
          })
        };
      case ADD_PARAMS:
        const addParamAction = action as AddParams;
        return {
          ...state,
          params: removeEmptyParams({
            ...state.params,
            ...addParamAction.params,
            q: getUniqueQParams(addParamAction, state)
          })
        };
      case REMOVE_PARAMS:
        const removeParamsState = { ...state };
        (action as RemoveParams).params.forEach((key) => {
          if (removeParamsState.params.hasOwnProperty(key)) {
            delete removeParamsState.params[key];
          }
        });
        return removeParamsState;
      default:
        return state;
    }
  };

function getUniqueQParams(action: AddParams | SetParams, state) {
  let qParmas = [].concat(state.params.q || []);
  // Ensure q params are unique
  if (action.params.q) {
    qParmas = qParmas.concat(action.params.q)
      .filter((q, index, self) => self.findIndex(
        (qs) => {
          return qs.key === q.key;
        }
      ) === index)
      .filter((q: QParam) => {
        // Filter out empties
        return !!q.value;
      });
  }
  return qParmas;
}

function removeEmptyParams(params: PaginationParam) {
  const newObject = {};
  Object.keys(params).forEach(key => {
    if (params[key]) {
      newObject[key] = params[key];
    }
  });
  return newObject;
}

function getActionType(action) {
  return action.apiType || action.type;
}

function getAction(action): PaginatedAction {
  if (!action) {
    return null;
  }
  return action.apiAction ? action.apiAction : action;
}

function getActionKey(action) {
  const apiAction = getAction(action);
  return apiAction.entityKey || null;
}

function getPaginationKey(action) {
  const apiAction = getAction(action);
  return apiAction.paginationKey;
}

export const getPaginationObservables = (function () {
  const mem = {};
  return function ({ store, action, schema }: { store: Store<AppState>, action: PaginatedAction, schema: Schema }): {
    entities$: Observable<any[]>,
    pagination$: Observable<PaginationEntityState>
  } {
    const _key = action.entityKey + action.paginationKey;
    if (mem[_key]) {
      return mem[_key];
    }
    const { entityKey, paginationKey } = action;

    if (action.initialParams) {
      store.dispatch(new SetParams(entityKey, paginationKey, action.initialParams));
    }

    const paginationSelect$ = store.select(selectPaginationState(entityKey, paginationKey));

    const pagination$: Observable<PaginationEntityState> = paginationSelect$
      .filter(pagination => !!pagination);

    const entities$: Observable<any[]> = paginationSelect$
      .do(pagination => {
        if (!hasError(pagination) && !hasValidOrGettingPage(pagination)) {
          store.dispatch(action);
        }
      })
      .filter(pagination => {
        return isPageReady(pagination);
      })
      .withLatestFrom(store.select(getEntityState))
      .map(([paginationEntity, entities]) => {
        const page = paginationEntity.ids[paginationEntity.currentPage];
        return page ? denormalize(page, schema, entities) : null;
      });

    const obs = {
      pagination$,
      entities$
    };

    mem[_key] = obs;
    console.log(_key);

    return obs;
  };
})();

function isPageReady(pagination: PaginationEntityState) {
  return !!pagination && !!pagination.ids[pagination.currentPage];
}

function hasValidOrGettingPage(pagination: PaginationEntityState) {
  if (pagination && Object.keys(pagination).length) {
    const hasPage = !!pagination.ids[pagination.currentPage];

    return pagination.fetching || hasPage;
  } else {
    return false;
  }
}

function hasError(pagination: PaginationEntityState) {
  return pagination && pagination.error;
}

export function paginationReducer(state = defaultEntitiesState, action) {
  if (action.type === ApiActionTypes.API_REQUEST) {
    return state;
  }

  if (action.type === CLEAR_PAGES) {
    if (state[action.entityKey] && state[action.entityKey][action.paginationKey]) {
      const newState = { ...state };
      const entityState = {
        ...newState[action.entityKey],
        [action.paginationKey]: {
          ...newState[action.entityKey][action.paginationKey],
          ids: {},
          fetching: false,
          pageCount: 0,
          currentPage: 1,
          totalResults: 0,
          error: false,
          message: ''
        }
      };
      return {
        ...newState,
        [action.entityKey]: entityState
      };
    }
  }

  if (action.type === CLEAR_PAGINATION_OF_TYPE) {
    if (state[action.entityKey]) {
      const clearState = { ...state };
      clearState[action.entityKey] = {};
      return clearState;
    }
    return state;
  }

  const actionType = getActionType(action);
  const key = getActionKey(action);
  const paginationKey = getPaginationKey(action);
  if (actionType && key && paginationKey) {
    const newState = { ...state };

    const updatedPaginationState = updatePagination(newState[key][paginationKey], action, actionType);
    newState[key] = mergeState(newState[key], {
      [paginationKey]: updatedPaginationState
    });
    return newState;
  } else {
    return state;
  }
}
