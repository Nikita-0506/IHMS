from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):

	page_size = 10

	page_size_query_param = 'page_size'

	max_page_size = 100


def build_pagination_meta(page):

	return {
		'page': page.number,
		'pages': page.paginator.num_pages,
		'total_records': page.paginator.count,
		'has_next': page.has_next(),
		'has_previous': page.has_previous(),
	}

