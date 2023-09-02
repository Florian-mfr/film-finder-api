import { SortOrder } from 'mongoose';
import { FILTERS } from './filter-handler.utils';

export function handleFilter(filter) {
  const filterObj = {
    $or: [],
  };
  for (const [key, value] of Object.entries(filter)) {
    if (key === 'alphabetical' || key === 'date' || key === 'note') continue;
    if (
      (key === 'title' || key === 'director' || key === 'actors') &&
      typeof value === 'string'
    ) {
      filterObj.$or.push({ [key]: FILTERS[key](value) });
    } else if (key !== 'page' && value) {
      filterObj[key] = FILTERS[key](value);
    }
  }
  if (filterObj.$or.length === 0) {
    delete filterObj.$or;
  }
  return filterObj;
}

export function handleSort(filter: { [key: string]: string }): {
  [key: string]: SortOrder;
} {
  for (const [key, value] of Object.entries(filter)) {
    if (key === 'alphabetical') {
      if (value === 'asc') return { title: 'asc' };
      else return { title: 'desc' };
    }
    if (key === 'date') {
      if (value === 'asc') return { year: 1 };
      else return { year: -1 };
    }
    if (key === 'note') {
      if (value === 'asc') return { 'rating.score': 1 };
      else return { 'rating.score': -1 };
    }
  }
}

export function handlePagination(filter) {
  const page = Number(filter.page || 1);
  const limit = 20;
  const skip = (page - 1) * limit;
  return { skip, limit };
}
