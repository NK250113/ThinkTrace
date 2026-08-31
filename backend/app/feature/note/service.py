from sqlalchemy.ext.asyncio import AsyncSession
from re import match
from random import choice, randint

from app.core import models
from app.feature.note import repository, schemas, exceptions


async def load_note_display(db: AsyncSession, user_id: int) -> dict[int, str]:
    tag_ids = await repository.get_used_tags(db, user_id=user_id)
    priv_tag_ids = await repository.get_used_priv_tags(db, user_id=user_id)
    tags = {tag_id: await repository.get_tag_name(db, tag_id) for tag_id in set(tag_ids) | set(priv_tag_ids)}
    return tags

async def search_notes(db: AsyncSession, term: schemas.NotesSearch, user_id: int) -> list[schemas.NoteInfo]:
    notes = await repository.search_notes(db, term.tags, user_id)
    return [schemas.NoteInfo(note) for note in notes]

async def load_note(db: AsyncSession, user_id: int, note_id: int) -> schemas.NoteAllInfo:
    note = schemas.NoteAllInfo(await repository.get_note_by_id(db, note_id))
    if not note:
        raise exceptions.NoteNotFoundError(note_id)
    note.tags = {tag_id: await repository.get_tag_name(db, tag_id) for tag_id in await repository.get_used_tags(db, user_id)}
    note.priv_tags = {tag_id: await repository.get_tag_name(db, tag_id) for tag_id in await repository.get_used_priv_tags(db, user_id)}
    note.lines = [schemas.Line(line) for line in await repository.get_lines(db, note_id)]
    return note

async def commit_note(db: AsyncSession, user_id: int, note: schemas.NoteContent, commit_name: str) -> schemas.failureCommitLines:
    get_note = await repository.get_note_by_id(db, note.note_id)
    if not get_note:
        raise exceptions.NoteNotFoundError(note.note_id)
    return await repository.commit_note(db, note.note_id, commit_name, note.lines)

async def add_tag(db: AsyncSession, note_id: int, tag_name: str, user_id: int | None = None) -> None:
    tag_id = await repository.get_tag_id(db, tag_name)
    if not tag_id:
        await repository.insert_tag(db, tag_name)
    if user_id is None:
        await repository.append_tag(db, note_id, tag_id)
    else:
        await repository.append_priv_tag(db, note_id, tag_id, user_id)
