from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LikeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: UUID
    liked: bool
    likes_count: int


class SaveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: UUID
    saved: bool
    saves_count: int


class CommentCreateRequest(BaseModel):
    comment_text: str = Field(..., min_length=1, max_length=2000)
    parent_id: UUID | None = None


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    content_id: UUID
    user_id: UUID
    parent_id: UUID | None = None
    comment_text: str
    status: str
    created_at: datetime


class ShareRequest(BaseModel):
    channel: str = Field(default="whatsapp", max_length=50)


class ShareResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: UUID
    shares_count: int
    share_url: str


class FollowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    creator_id: UUID
    following: bool
    followers_count: int
