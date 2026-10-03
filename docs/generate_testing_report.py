#!/usr/bin/env python3
"""Generate Promax Care Mobile App Testing / Bug Report Word document."""

from datetime import date
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


def set_cell_shading(cell, color_hex: str):
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), color_hex)
    shading.set(qn("w:val"), "clear")
    cell._tc.get_or_add_tcPr().append(shading)


def add_heading(doc, text, level=1):
    heading = doc.add_heading(text, level=level)
    for run in heading.runs:
        run.font.color.rgb = RGBColor(0x03, 0x06, 0x37)
    return heading


def add_bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style="List Bullet")
    if bold_prefix:
        run = p.add_run(bold_prefix)
        run.bold = True
        p.add_run(text)
    else:
        p.add_run(text)
    return p


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    for i, header in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = header
        set_cell_shading(cell, "030637")
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.size = Pt(10)

    for row_idx, row_data in enumerate(rows):
        for col_idx, cell_text in enumerate(row_data):
            cell = table.rows[row_idx + 1].cells[col_idx]
            cell.text = str(cell_text)
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(10)

    doc.add_paragraph()
    return table


def severity_para(doc, label, color_hex):
    p = doc.add_paragraph()
    run = p.add_run(f"Severity: {label}")
    run.bold = True
    run.font.color.rgb = RGBColor(
        int(color_hex[0:2], 16),
        int(color_hex[2:4], 16),
        int(color_hex[4:6], 16),
    )
    return p


def build_document():
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("Promax Care Mobile App")
    run.bold = True
    run.font.size = Pt(22)
    run.font.color.rgb = RGBColor(0x03, 0x06, 0x37)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run("Testing Report — Staff Shift Issues")
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = meta.add_run(
        f"Report Date: {date.today().strftime('%d %B %Y')}  |  App Version: 1.1.0  |  Status: Open"
    )
    run.font.size = Pt(10)
    run.italic = True

    # 1. Summary
    add_heading(doc, "1. Summary", 1)
    doc.add_paragraph(
        "This short testing report documents four defects observed during staff shift operations "
        "on the Promax Care mobile application. Issues were reproduced against a live shift for "
        "staff Serah Adeniyi and client Ajeh Wumi Tao (3 October 2026, 4:15 PM – 5:18 PM Australian time). "
        "Evidence includes staff dashboard, shift detail, and admin Schedule Board screenshots."
    )

    add_table(
        doc,
        ["ID", "Issue", "Severity", "Status"],
        [
            ["BUG-01", "Trip can start before/after shift window", "High", "Open"],
            ["BUG-02", "Shift date/time shown on wrong day; clock-in blocked", "Critical", "Open"],
            ["BUG-03", "Document upload rejects images", "High", "Open"],
            ["BUG-04", "No client selection for multi-client report/trip", "High", "Open"],
        ],
    )

    # 2. Test Environment
    add_heading(doc, "2. Test Environment", 1)
    add_table(
        doc,
        ["Item", "Detail"],
        [
            ["Application", "Promax Care Mobile (Staff)"],
            ["Admin Reference", "ProMax Care web Schedule Board (app.promaxcare.com.au)"],
            ["Business Timezone", "Australia/Sydney"],
            ["Test Staff", "Serah Adeniyi"],
            ["Test Client", "Ajeh Wumi Tao"],
            ["Test Shift", "Sat 3 Oct 2026, 4:15 PM – 5:18 PM (Australian time)"],
            ["Activities", "Transport, Install phone, Personal Support"],
            ["Admin Board Status (at ~4:17 PM Sydney)", "In Progress"],
            ["Staff Detail Status (device ~7:20)", "Not Started"],
            ["Staff Roster Display", "Sunday 4 Oct, 1:15 AM – 3:18 AM, ACTIVE"],
        ],
    )

    # BUG-01
    add_heading(doc, "3. BUG-01 — Travel Trip Available Outside Shift Window", 1)
    severity_para(doc, "High", "C0392B")

    add_heading(doc, "3.1 Description", 2)
    doc.add_paragraph(
        "Staff can start or process a travelling trip before the shift has begun and after the "
        "shift has ended. Trip/travel actions should only be available while the shift is active "
        "(clocked in / in progress)."
    )

    add_heading(doc, "3.2 Evidence", 2)
    add_bullet(
        doc,
        " On shift detail while status shows “Not Started” and message reads "
        "“Your shift hasn't started yet…”, the transport (steering wheel) control remains visible "
        "and usable.",
        "Screenshot:",
    )
    add_bullet(
        doc,
        " Transport button is shown whenever the shift activities include “Transport”, with no "
        "check that the shift is in progress. Status-based guards are commented out in code "
        "(shift detail screen).",
        "Code note:",
    )

    add_heading(doc, "3.3 Steps to Reproduce", 2)
    for step in [
        "Open a shift that includes the Transport activity.",
        "Confirm shift status is Not Started / Upcoming (before start), or ended/Absent/Present (after end).",
        "Tap the transport / trip control on the shift detail screen.",
        "Observe that trip tracking can still be started or processed.",
    ]:
        doc.add_paragraph(step, style="List Number")

    add_heading(doc, "3.4 Expected vs Actual", 2)
    add_table(
        doc,
        ["Expected", "Actual"],
        [
            [
                "Trip start/process only when shift is In Progress (staff clocked in).",
                "Trip control available before start and after shift has passed.",
            ]
        ],
    )

    # BUG-02
    add_heading(doc, "4. BUG-02 — Incorrect Shift Date/Time and Blocked Clock-In", 1)
    severity_para(doc, "Critical", "8B0000")

    add_heading(doc, "4.1 Description", 2)
    doc.add_paragraph(
        "A shift created for 3 October 2026, 4:15 PM – 5:18 PM Australian time appears on the "
        "staff dashboard as 4 October with times 1:15 AM – 3:18 AM. Opening shift detail shows "
        "Date as 3 October, but status remains “Not Started” and clock-in is unavailable, even "
        "when the admin Schedule Board (Sydney time) shows the same shift as “In Progress”."
    )
    doc.add_paragraph(
        "This indicates inconsistent timezone handling between roster day grouping, detail date "
        "display, clock-in window logic, and/or device local time versus Australia/Sydney."
    )

    add_heading(doc, "4.2 Evidence", 2)
    add_bullet(
        doc,
        " Admin Schedule Board at 4:17:31 pm – Sydney, AU shows shift Sat Oct 3, "
        "4:15 PM – 5:18 PM as “In Progress”.",
        "Admin:",
    )
    add_bullet(
        doc,
        " Staff Shift Roster selects Sunday Oct 4 and shows the same client/activities at "
        "1:15 AM – 3:18 AM with status ACTIVE.",
        "Staff roster:",
    )
    add_bullet(
        doc,
        " Shift detail title/client Ajeh Wumi Tao; Date field “3 October, 2026”; "
        "status “Not Started”; CTA “Request to Cancel Shift” (no clock-in).",
        "Staff detail:",
    )
    add_bullet(
        doc,
        " Detail “Date” uses dateCreated (not dateFrom). Roster calendar day chips use "
        "device-local dates while shift grouping/times use Australia/Sydney helpers — "
        "mixed sources can place a shift on the wrong day and block clock-in.",
        "Code note:",
    )

    add_heading(doc, "4.3 Steps to Reproduce", 2)
    for step in [
        "In admin, create/confirm a shift for 3 Oct 2026, 4:15 PM – 5:18 PM Australian time.",
        "On staff mobile, open Shift Roster and locate the shift.",
        "Observe which calendar day and start/end times are shown.",
        "Open shift detail and compare Date, Start Time, End Time, and status.",
        "Attempt to clock in while admin board shows the shift In Progress in Sydney time.",
    ]:
        doc.add_paragraph(step, style="List Number")

    add_heading(doc, "4.4 Expected vs Actual", 2)
    add_table(
        doc,
        ["Expected", "Actual"],
        [
            [
                "Roster and detail show 3 Oct 2026, 4:15 PM – 5:18 PM (Sydney).",
                "Roster shows 4 Oct, 1:15 AM – 3:18 AM; detail Date shows 3 Oct.",
            ],
            [
                "Staff can clock in once Sydney window is open / shift has started.",
                "Status stays Not Started; clock-in unavailable; only cancel offered.",
            ],
            [
                "Staff status matches admin Schedule Board for the same shift.",
                "Admin: In Progress; Staff detail: Not Started.",
            ],
        ],
    )

    # BUG-03
    add_heading(doc, "5. BUG-03 — Document Upload Does Not Accept Images", 1)
    severity_para(doc, "High", "C0392B")

    add_heading(doc, "5.1 Description", 2)
    doc.add_paragraph(
        "Staff document upload should accept image files (e.g. photos of certificates and IDs). "
        "In practice, image selection/upload is not accepted as expected for compliance documents."
    )

    add_heading(doc, "5.2 Evidence / Technical Note", 2)
    add_bullet(
        doc,
        " Upload uses DocumentPicker with a limited MIME list: image/jpeg, application/pdf, "
        "and Word types only. image/png (and broader image/*) are not included.",
        "Picker types:",
    )
    add_bullet(
        doc,
        " There is no ImagePicker / camera path on the document forms (unlike profile photo), "
        "so many phone photos (often PNG/HEIC) cannot be selected reliably.",
        "UX gap:",
    )

    add_heading(doc, "5.3 Steps to Reproduce", 2)
    for step in [
        "Open Documents tab → Add / upload a compliance document.",
        "Attempt to select a PNG, HEIC, or gallery photo of a certificate.",
        "Observe that the image is rejected, unavailable in the picker, or fails upload.",
        "Retry with PDF (if available) to confirm non-image types still work.",
    ]:
        doc.add_paragraph(step, style="List Number")

    add_heading(doc, "5.4 Expected vs Actual", 2)
    add_table(
        doc,
        ["Expected", "Actual"],
        [
            [
                "Staff can upload common image formats (JPEG, PNG; ideally HEIC via conversion) "
                "and PDF for compliance documents.",
                "Images are not accepted reliably; picker/MIME allow-list is too narrow.",
            ]
        ],
    )

    # BUG-04
    add_heading(doc, "6. BUG-04 — No Client Selection for Multi-Client Report / Trip", 1)
    severity_para(doc, "High", "C0392B")

    add_heading(doc, "6.1 Description", 2)
    doc.add_paragraph(
        "When multiple clients are assigned to a staff member on a shift, a single shift report "
        "and a single travelled trip are tied to both clients together. Staff cannot choose "
        "which client the report applies to, or which client a trip covers."
    )

    add_heading(doc, "6.2 Evidence / Technical Note", 2)
    add_bullet(
        doc,
        " Shift model exposes a combined clients string and a single profile object; "
        "report submit payload sends shiftRosterId + form fields with no clientId selector.",
        "Data model:",
    )
    add_bullet(
        doc,
        " Report header displays the full clients string; trip flow is keyed by shiftId only.",
        "UI:",
    )

    add_heading(doc, "6.3 Steps to Reproduce", 2)
    for step in [
        "Assign a shift (or scenario) with more than one client for the same staff member.",
        "Open shift report creation from the mobile app.",
        "Observe that there is no client picker; one report covers all listed clients.",
        "Start/save a transport trip for the same shift.",
        "Observe that the trip is not attributed to a specific client.",
    ]:
        doc.add_paragraph(step, style="List Number")

    add_heading(doc, "6.4 Expected vs Actual", 2)
    add_table(
        doc,
        ["Expected", "Actual"],
        [
            [
                "Staff selects which client a shift report is for when multiple clients apply.",
                "One report is tied to all clients on the shift.",
            ],
            [
                "Staff selects which client a travelled trip covers.",
                "Trip is recorded against the shift only, not a chosen client.",
            ],
        ],
    )

    # Recommendations
    add_heading(doc, "7. Recommended Fixes (Testing Focus)", 1)
    add_table(
        doc,
        ["Bug", "Recommended Fix Direction", "Suggested Retest"],
        [
            [
                "BUG-01",
                "Gate TransportButton / trip start to Clock-In or Shift In Progress only; "
                "block after Present/Absent/Cancelled/Upcoming.",
                "Before start, during active, after end — only mid-shift allows trip.",
            ],
            [
                "BUG-02",
                "Standardise all roster day keys, calendar selection, detail Date, and "
                "clock-in windows on Australia/Sydney; show dateFrom (not dateCreated) as "
                "shift date; align staff status with admin Sydney clock.",
                "Create Sydney-afternoon shift; verify day, times, In Progress, and clock-in "
                "on a device set to a non-AU timezone.",
            ],
            [
                "BUG-03",
                "Accept image/jpeg, image/png, and preferably ImagePicker/camera with "
                "conversion; keep PDF/Word support.",
                "Upload JPEG, PNG, and camera photo for a required document type.",
            ],
            [
                "BUG-04",
                "Add mandatory client selector on report create and trip start when "
                "clients.length > 1; persist clientId on report and trip payloads.",
                "Multi-client shift: submit two reports and two trips for different clients.",
            ],
        ],
    )

    # Sign-off
    add_heading(doc, "8. Sign-Off", 1)
    add_table(
        doc,
        ["Role", "Name", "Date", "Signature"],
        [
            ["Tester", "", "", ""],
            ["Developer", "", "", ""],
            ["Product / Ops", "", "", ""],
        ],
    )

    footer = doc.add_paragraph()
    footer.add_run(
        "Attachments: Staff roster (Oct 4 display), shift detail (Not Started + transport), "
        "admin Schedule Board (In Progress, Sydney). Screenshots retained with this report."
    ).italic = True

    return doc


if __name__ == "__main__":
    import os

    output_path = os.path.join(os.path.dirname(__file__), "Promax_Care_Testing_Report.docx")
    build_document().save(output_path)
    print(f"Document saved to: {output_path}")
