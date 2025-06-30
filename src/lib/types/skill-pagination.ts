export interface PaginationState<T> {
	items: T[];
	currentPage: number;
	itemsPerPage: number;
	totalPages: number;
	searchTerm: string;
	filteredItems: T[];
	paginatedItems: T[];
}
