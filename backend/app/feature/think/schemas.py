from pydantic import BaseModel
import datetime

from app.core import models


class Line(BaseModel):
    content: str
    logic_type: int
    parent_id: int | None
    sort_order: int
    def create(self, user: models.Lines | None = None):
        if user is not None:
            self.content = user.content
            self.logic_type = user.logic_type
            self.parent_id = user.parent_id
            self.sort_order = user.sort_order
            return self

# リクエスト

class NoteContent(BaseModel):
    note_id: int
    lines: list[Line]

# レスポンス

class TagInfo(BaseModel):
    id: int
    name: str
    count: int

class NoteAllInfo(BaseModel):
    id: int
    name: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    tags: dict[int, str]
    priv_tags: dict[int, str]
    lines: list[Line]
    def create(self, note: models.Notes | None = None):
        if note is not None:
            self.id = note.id
            self.name = note.name
            self.created_at = note.created_at
            self.updated_at = note.updated_at
            return self

class NoteInfo(BaseModel):
    id: int
    name: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    def create(self, note: models.Notes | None = None):
        if note is not None:
            self.id = note.id
            self.name = note.name
            self.created_at = note.created_at
            self.updated_at = note.updated_at

            return self

class failureCommitLines(BaseModel):
    failed_lines: list[Line]