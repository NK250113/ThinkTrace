from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.core.schemas import error
from app.feature.note import schemas, service
from app.feature.auth.deps import get_current_user
from app.feature.auth.schemas import UserResponse

app = APIRouter(prefix="/api/note")

@app.get("/load", response_model=schemas.NoteAllInfo, responses={404: {"model": error.ErrorResponse}})
async def load_note_display(user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)) -> schemas.NoteAllInfo:
    note = await service.load_note_display(db, user_id=user.id)
    return note

@app.get("/search",
         response_model=list[schemas.NoteInfo],
         responses={}
)
async def search_notes(note: schemas.NotesSearch, user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)) -> list[schemas.NoteInfo]:
    notes = await service.search_notes(db, note, user_id=user.id)
    return notes

@app.get("/{note_id}", response_model=schemas.NoteAllInfo, responses={404: {"model": error.ErrorResponse}})
async def load_note(note_id: int, user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)) -> schemas.NoteAllInfo:
    note = await service.load_note(db, user_id=user.id, note_id=note_id)
    return note

# ここだけ未完成
@app.post("/{note_id}/commit", response_model=schemas.failureCommitLines, responses={404: {"model": error.ErrorResponse}})
async def commit_note(note: schemas.NoteContent, commit_name: str, user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)) -> schemas.failureCommitLines:
    note = await service.commit_note(db, user_id=user.id, note=note, commit_name=commit_name)
    return note

@app.post("/{note_id}/add_tag", response_model=None, responses={404: {"model": error.ErrorResponse}})
async def add_tag(note_id: int, tag_name: str, db: AsyncSession = Depends(database.get_db)) -> None:
    note = await service.add_tag(db, note_id, tag_name)
    return

@app.post("/{note_id}/add_tag_priv", response_model=None, responses={404: {"model": error.ErrorResponse}})
async def add_tag(note_id: int, tag_name: str, user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)) -> None:
    note = await service.add_tag(db, note_id, tag_name, user_id=user.id)
    return
