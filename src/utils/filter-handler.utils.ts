export const FILTERS = {
  title: stringFilter,
  genres: arrayAllFilter,
  origin: arrayInFilter,
  director: stringFilter,
  actors: arrayExactFilter,
  version: arrayInFilter,
  quality: arrayInFilter,
};

function stringFilter(value: string) {
  if (value) {
    return new RegExp(`${value.replace('_', ' ').trim()}`, 'i');
  }
}

function arrayExactFilter(value: string) {
  if (!value) return '';
  return { $in: [new RegExp(value.replace('_', ' '), 'i')] };
}

function arrayInFilter(value: string) {
  if (!value) return '';
  const values = value.replace('_', ' ').split(',');
  return { $in: values };
}

function arrayAllFilter(value: string) {
  if (!value) return '';
  const values = value.replace('_', ' ').split(',');
  return { $all: values };
}
