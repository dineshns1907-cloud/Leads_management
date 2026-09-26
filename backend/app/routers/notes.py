from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.lead import Lead
from app.models.note import Note
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.core.security import get_current_user

router = APIRouter(tags=["Notes"])

def _extract_mock_ai_signals(content: str) -> List[str]:
    signals = []
    c_lower = content.lower()
    if "budget" in c_lower or "price" in c_lower or "cost" in c_lower:
        signals.append("Budget / Commercial Authority")
    if "decision" in c_lower or "cfo" in c_lower or "vp" in c_lower or "board" in c_lower:
        signals.append("Key Decision Maker Identified")
    if "security" in c_lower or "compliance" in c_lower or "soc2" in c_lower:
        signals.append("Technical & Security Compliance Evaluation")
    if "timeline" in c_lower or "quarter" in c_lower or "urgent" in c_lower:
        signals.append("Near-Term Buying Urgency")
    if not signals:
        signals.append("Relationship & Account Context")
    return signals

@router.get("/leads/{lead_id}/notes", response_model=List[NoteResponse], summary="Get notes for a lead")
def get_lead_notes(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    notes = db.query(Note).filter(Note.lead_id == lead_id).order_by(Note.created_at.desc()).all()
    return [
        NoteResponse(
            id=n.id,
            lead_id=n.lead_id,
            user_id=n.user_id,
            author_name=n.user.name if n.user else "Sales Representative",
            content=n.content,
            ai_signals=n.ai_signals or [],
            created_at=n.created_at,
            updated_at=n.updated_at
        ) for n in notes
    ]

@router.post("/leads/{lead_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED, summary="Add a sales note to a lead")
def add_lead_note(
    lead_id: str,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    now = datetime.now(timezone.utc)
    signals = _extract_mock_ai_signals(note_in.content)

    note = Note(
        lead_id=lead_id,
        user_id=current_user.id,
        content=note_in.content,
        ai_signals=signals,
        created_at=now,
        updated_at=now
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return NoteResponse(
        id=note.id,
        lead_id=note.lead_id,
        user_id=note.user_id,
        author_name=current_user.name,
        content=note.content,
        ai_signals=note.ai_signals,
        created_at=note.created_at,
        updated_at=note.updated_at
    )

@router.put("/notes/{note_id}", response_model=NoteResponse, summary="Edit a sales note")
def update_note(
    note_id: str,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    if note.user_id != current_user.id and current_user.role not in ("MANAGER", "ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit notes authored by another representative")

    note.content = note_in.content
    note.ai_signals = _extract_mock_ai_signals(note_in.content)
    note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)

    return NoteResponse(
        id=note.id,
        lead_id=note.lead_id,
        user_id=note.user_id,
        author_name=note.user.name if note.user else "Sales Representative",
        content=note.content,
        ai_signals=note.ai_signals,
        created_at=note.created_at,
        updated_at=note.updated_at
    )

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a sales note")
def delete_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    if note.user_id != current_user.id and current_user.role not in ("MANAGER", "ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete notes authored by another representative")

    db.delete(note)
    db.commit()
    return None
