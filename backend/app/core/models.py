from sqlalchemy import String, Index, Text, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from datetime import datetime

class Base(DeclarativeBase):
    pass


class Users(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text) # SQLインジェクション対策はSQLAlchemyに任せる
    hashed_password: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True)
    notes: Mapped[list["Notes"]] = relationship(
        back_populates="user"
    )
    notes: Mapped[list["Notes"]] = relationship(
        secondary="note_tags",
        back_populates="users"
    )
    tags: Mapped[list["Tags"]] = relationship(
        secondary="note_tags",
        back_populates="users"
    )
    guests: Mapped[list["Guests"]] = relationship(
        back_populates="users"
    )
    inquiries: Mapped[list["Inquiries"]] = relationship(
        back_populates="users"
    )

class Notes(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    lines: Mapped[list["Lines"]] = relationship(
        back_populates="note"
    )
    commits: Mapped[list["Commits"]] = relationship(
        back_populates="note"
    )
    user: Mapped["Users"] = relationship(
        back_populates="notes"
    )
    users: Mapped[list["Users"]] = relationship(
        secondary="note_tags",
        back_populates="notes"
    )
    tags: Mapped[list["Tags"]] = relationship(
        secondary="note_tags",
        back_populates="notes"
    )
    guests: Mapped[list["Guests"]] = relationship(
        back_populates="notes"
    )

class Tags(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(Text, unique=True)
    users: Mapped[list["Users"]] = relationship(
        secondary="note_tags",
        back_populates="tags"
    )
    notes: Mapped[list["Notes"]] = relationship(
        secondary="note_tags",
        back_populates="tags"
    )

class NoteTags(Base):
    __tablename__ = "note_tags"

    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id"), primary_key=True)
    is_public: Mapped[bool] = mapped_column(default=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
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
    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(Text)
    logic_type: Mapped[int] = mapped_column()
    parent_id: Mapped[int] = mapped_column(ForeignKey("lines.id"))
    sort_order: Mapped[int] = mapped_column()

class Lines(LineMixin, Base):
    __tablename__ = "lines"

    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id"), index=True)
    note: Mapped["Notes"] = relationship(
        back_populates="lines"
    )

class Commits(Base):
    __tablename__ = "commits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(Text)
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id"))
    note: Mapped["Notes"] = relationship(
        back_populates="commits"
    )

class CommitLines(Base, LineMixin):
    __tablename__ = "commit_lines"

    commit_id: Mapped[int] = mapped_column(ForeignKey("commits.id"), index=True)
    commit: Mapped["Commits"] = relationship(
        back_populates="lines"
    )

class Guests(Base):
    __tablename__ = "guests"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id"), primary_key=True)
    auth_type: Mapped[int] = mapped_column()

class Settings(Base):
    __tablename__ = "settings"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)

class Inquiries(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    inquiry_type: Mapped[int] = mapped_column()