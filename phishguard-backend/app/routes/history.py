import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.models.schemas import ExportFormatRequest
from app.services.supabase_service import get_current_user, supabase_service

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
def get_history(user: dict = Depends(get_current_user)):
    return supabase_service.get_history(user["id"])


@router.post("/history/export")
def export_history(payload: ExportFormatRequest, user: dict = Depends(get_current_user)):
    rows = supabase_service.get_history(user["id"], limit=500)

    if payload.format == "csv":
        buffer = io.StringIO()
        if rows:
            writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
        stream = io.BytesIO(buffer.getvalue().encode("utf-8"))
        return StreamingResponse(
            stream,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=scan-history.csv"},
        )

    if payload.format == "pdf":
        stream = io.BytesIO()
        pdf = canvas.Canvas(stream, pagesize=letter)
        y = 760
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(40, y, "PhishGuard Scan History")
        y -= 30
        pdf.setFont("Helvetica", 9)

        for row in rows[:80]:
            line = f"{row.get('created_at', '')} | {row.get('prediction', '')} | {row.get('url', '')[:70]}"
            pdf.drawString(40, y, line)
            y -= 12
            if y < 40:
                pdf.showPage()
                y = 760
                pdf.setFont("Helvetica", 9)

        pdf.save()
        stream.seek(0)
        return StreamingResponse(
            stream,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=scan-history.pdf"},
        )

    raise HTTPException(status_code=400, detail="Unsupported format")
