from sqlalchemy import select, intersect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import models


async def get_used_tags(db: AsyncSession, user_id: int) -> list[int] | None:
    result = await db.execute(select(models.NoteTags.tag_id).where(
        models.NoteTags.note_id == select(models.Notes.id).where(models.Notes.id == user_id)
    ))
    return result.scalars().all()

async def get_used_priv_tags(db: AsyncSession, user_id: int) -> list[int] | None:
    result = await db.execute(select(models.NoteTags.tag_id).where(
        models.NoteTags.user_id == user_id
    ))
    return result.scalars().all()

async def get_tag_name(db: AsyncSession, tag_id: int) -> str | None:
    result = await db.execute(select(models.Tags.content).where(models.Tags.id == tag_id))
    return result.scalar_one_or_none()

async def get_note_by_id(db: AsyncSession, note_id: int) -> models.Notes | None:
    result = await db.execute(select(models.Notes).where(models.Notes.id == note_id))
    note = result.scalar_one_or_none()
    return note

async def search_notes(db: AsyncSession, tag_ids: list[models.Tags], user_id: int) -> list[models.Notes]:
    queries = [
        select(models.NoteTags.note_id).where(
            (models.NoteTags.is_public or models.NoteTags.user_id == user_id)
            and models.NoteTags.tag_id == tag.id
        )
        for tag in tag_ids
    ]
    query = (
        select(models.Notes)
        .where(
            models.Notes.user_id == user_id,
            models.Notes.id.in_(intersect(*queries)),
        )
    )
    result = await db.execute(query)
    notes = result.scalars().all()
    return notes

async def get_lines(db: AsyncSession, note_id: int) -> list[models.Lines]:
    result = await db.execute(select(models.Lines).where(models.Lines.note_id == note_id))
    lines = result.scalars().all()
    return lines

"""
フロントエンドの実装をある程度を行ってからWuのアルゴリズムなどを使って実装
async def commit_note(db: AsyncSession, note_id: int, commit_name: str, lines: list[schemas.Line]) -> schemas.failureCommitLines:
    failed_lines = []
    for line in note_content.lines:
        try:
            await commit_line(db, note_id, line)
        except Exception as e:
            failed_lines.append(line.content)

    return schemas.failureCommitLines(failed_lines=failed_lines)
"""

async def get_tag_id(db: AsyncSession, tag_name: str) -> int | None:
    result = await db.execute(select(models.Tags.id).where(models.Tags.content == tag_name))
    return result.scalar_one_or_none()

async def insert_tag(db: AsyncSession, tag_name: str) -> int:
    tag = models.Tags(content=tag_name)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag.id

async def append_tag(db: AsyncSession, note_id: int, tag_id: int) -> None:
    note_tag = models.NoteTags(note_id=note_id, tag_id=tag_id, is_public=True)
    db.add(note_tag)
    await db.commit()

async def append_priv_tag(db: AsyncSession, note_id: int, tag_id: int, user_id: int) -> None:
    note_tag = models.NoteTags(note_id=note_id, tag_id=tag_id, is_public=False, user_id=user_id)
    db.add(note_tag)
    await db.commit()