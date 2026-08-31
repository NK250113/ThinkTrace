from pydantic import BaseModel

from app.core import models


class Line(BaseModel):
    content: str
    logic_type: int
    parent_id: int | None
    sort_order: int
    def __init__(self, user: models.Lines | None = None):
        if user is not None:
            self.content = user.content
            self.logic_type = user.logic_type
            self.parent_id = user.parent_id
            self.sort_order = user.sort_order

# リクエスト

class NotesSearch(BaseModel):
    tags: list[int]

class NoteContent(BaseModel):
    note_id: int
    lines: list[Line]

# レスポンス

class NoteAllInfo(BaseModel):
    id: int
    name: str
    tags: dict[int, str]
    priv_tags: dict[int, str]
    lines: list[Line]
    def __init__(self, user: models.Notes | None = None):
        if user is not None:
            self.id = user.id
            self.name = user.name

class NoteInfo(BaseModel):
    id: int
    name: str
    def __init__(self, user: models.Notes | None = None):
        if user is not None:
            self.id = user.id
            self.name = user.name

class failureCommitLines(BaseModel):
    failed_lines: list[Line]