/**
 * Review filter and sort options
 * Used in the AllReviewsScreen for filtering and sorting reviews
 */

export interface FilterOption {
  id: string;
  label: string;
  value: string | number;
}

export interface SortOption {
  id: string;
  label: string;
  value: string;
}

// Filter options for reviews
export const reviewFilterOptions: FilterOption[] = [
  { id: 'all', label: 'All', value: 'all' },
  { id: '5', label: '5 Stars', value: 5 },
  { id: '4', label: '4 Stars', value: 4 },
  { id: '3', label: '3 Stars', value: 3 },
  { id: '2', label: '2 Stars', value: 2 },
  { id: '1', label: '1 Star', value: 1 },
  { id: 'photos', label: 'With Photos', value: 'photos' },
];

// Sort options for reviews
export const reviewSortOptions: SortOption[] = [
  { id: 'newest', label: 'Newest', value: 'newest' },
  { id: 'oldest', label: 'Oldest', value: 'oldest' },
  { id: 'highest', label: 'Highest Rating', value: 'highest' },
  { id: 'lowest', label: 'Lowest Rating', value: 'lowest' },
];