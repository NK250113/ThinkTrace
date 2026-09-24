import uuid
from sqlalchemy import UUID, Index, Text, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from datetime import datetime

class Base(DeclarativeBase):
    pass


class Users(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,)
    name: Mapped[str] = mapped_column(Text) # SQLインジェクション対策はSQLAlchemyに任せる
    hashed_password: Mapped[str] = mapped_column(Text)
    email: Mapped[str] = mapped_column(Text, unique=True)

    notes: Mapped[list["Notes"]] = relationship(back_populates="author")
    tags: Mapped[list["NoteTags"]] = relationship(back_populates="tag_adder")
    invited_notes: Mapped[list["Guests"]] = relationship(back_populates="guest_user")
    settings: Mapped["Settings"] = relationship(back_populates="user")
    inquiries: Mapped[list["Inquiries"]] = relationship(back_populates="inquirer")

class Notes(Base):
    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,)
    name: Mapped[str] = mapped_column(Text)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    lines: Mapped[list["Lines"]] = relationship(back_populates="note")
    commits: Mapped[list["Commits"]] = relationship(back_populates="note")
    author: Mapped["Users"] = relationship(back_populates="notes")
    tags: Mapped[list["NoteTags"]] = relationship(back_populates="note")
    guest_users: Mapped[list["Guests"]] = relationship(back_populates="note")

class Tags(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,)
    content: Mapped[str] = mapped_column(Text, unique=True)
    used: Mapped[list["NoteTags"]] = relationship(back_populates="tag")

class NoteTags(Base):
    __tablename__ = "note_tags"

    note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), primary_key=True)
    tag_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tags.id"), primary_key=True)
    is_public: Mapped[bool] = mapped_column(default=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)

    tag_adder: Mapped["Users"] = relationship(back_populates="tags")
    note: Mapped["Notes"] = relationship(back_populates="tags")
    tag: Mapped["Tags"] = relationship(back_populates="used")
    __table_args__ = (
        Index(
            "ix_note_tags_tag_note",
            "is_public",
            "user_id",
            "tag_id"
        ),
    )

class LineMixin:
    __abstract__ = True
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,)
    content: Mapped[str] = mapped_column(Text)
    logic_type: Mapped[int] = mapped_column()
    sort_order: Mapped[int] = mapped_column()

class Lines(LineMixin, Base):
    __tablename__ = "lines"

    note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), index=True)
    parent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lines.id"))
    note: Mapped["Notes"] = relationship(back_populates="lines")

class Commits(Base):
    __tablename__ = "commits"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(Text)
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"))

    lines: Mapped[list["CommitLines"]] = relationship(back_populates="commit")
    note: Mapped["Notes"] = relationship(back_populates="commits")

class CommitLines(LineMixin, Base):
    __tablename__ = "commit_lines"

    commit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("commits.id"), index=True)
    parent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("commit_lines.id"))
    commit: Mapped["Commits"] = relationship(back_populates="lines")

class Guests(Base):
    __tablename__ = "guests"


    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    note_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notes.id"), primary_key=True)
    auth_type: Mapped[int] = mapped_column()

    guest_user: Mapped["Users"] = relationship(back_populates="invited_notes")
    note: Mapped["Notes"] = relationship(back_populates="guest_users")

class Settings(Base):
    __tablename__ = "settings"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    # 中身はいろいろ終わってから
    user: Mapped["Users"] = relationship(back_populates="settings")

class Inquiries(Base):
    __tablename__ = "inquiries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    inquiry_type: Mapped[int] = mapped_column()
    inquirer: Mapped["Users"] = relationship(back_populates="inquiries")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    family_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)