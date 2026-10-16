import csv
import io
from abc import ABC, abstractmethod
from typing import List
from ..models import RepairRequest

class BaseReportExporter(ABC):
    """
    Polymorphism demonstration:
    Abstract base interface for different report export strategies (CSV, PDF/Print slip).
    """
    @abstractmethod
    def export(self, requests: List[RepairRequest]) -> bytes:
        """Export list of repair requests into specific format binary bytes."""
        pass

    @abstractmethod
    def get_content_type(self) -> str:
        """Return HTTP MIME content type."""
        pass

    @abstractmethod
    def get_file_extension(self) -> str:
        """Return default file extension."""
        pass


class CsvReportExporter(BaseReportExporter):
    """Concrete exporter producing UTF-8-SIG encoded CSV for Excel compatibility."""

    def export(self, requests: List[RepairRequest]) -> bytes:
        output = io.StringIO()
        # UTF-8 BOM so Excel opens Thai characters without garbling
        output.write('\ufeff')
        writer = csv.writer(output)

        # Header row
        writer.writerow([
            'เลขที่ใบแจ้งซ่อม',
            'วันที่แจ้ง',
            'ผู้แจ้งซ่อม',
            'หน่วยงาน/กลุ่มสาระ',
            'อาคาร/สถานที่',
            'ห้อง/จุดติดตั้ง',
            'ประเภทปัญหา',
            'ระดับความเร่งด่วน',
            'สถานะ',
            'ช่างผู้รับผิดชอบ',
            'กำหนดเสร็จ',
            'วันที่ซ่อมเสร็จ',
            'ค่าใช้จ่าย (บาท)',
            'ผลการซ่อม/รายละเอียด'
        ])

        for req in requests:
            writer.writerow([
                req.request_no,
                req.created_at.strftime('%Y-%m-%d %H:%M') if req.created_at else '',
                req.reporter.fullname if req.reporter else '',
                req.reporter.department if req.reporter else '',
                req.building,
                req.room,
                req.problem_type_display,
                req.urgency_display,
                req.status_display,
                req.technician.fullname if req.technician else 'ยังไม่ได้มอบหมาย',
                req.due_date.strftime('%Y-%m-%d') if req.due_date else '',
                req.completion_date.strftime('%Y-%m-%d %H:%M') if req.completion_date else '',
                f"{req.cost:.2f}" if req.cost is not None else '0.00',
                req.result or req.description
            ])

        return output.getvalue().encode('utf-8-sig')

    def get_content_type(self) -> str:
        return 'text/csv; charset=utf-8'

    def get_file_extension(self) -> str:
        return 'csv'


class ReportService:
    """Service utilizing polymorphic report exporters."""
    def __init__(self):
        self.exporters = {
            'csv': CsvReportExporter()
        }

    def export_data(self, requests: List[RepairRequest], format_type: str = 'csv') -> tuple[bytes, str, str]:
        exporter = self.exporters.get(format_type.lower())
        if not exporter:
            raise ValueError(f"รูปแบบรายงาน '{format_type}' ไม่รองรับ")

        data = exporter.export(requests)
        mime = exporter.get_content_type()
        ext = exporter.get_file_extension()
        return data, mime, ext
