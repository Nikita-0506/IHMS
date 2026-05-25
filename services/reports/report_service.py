from datetime import datetime


class ReportService:

	@staticmethod
	def build_metadata(report_name, generated_by='system'):

		return {
			'report_name': report_name,
			'generated_at': datetime.utcnow().isoformat(),
			'generated_by': generated_by,
		}

	@staticmethod
	def to_tabular_rows(records, fields):

		rows = []

		for record in records:

			row = {field: getattr(record, field, None) for field in fields}

			rows.append(row)

		return rows

