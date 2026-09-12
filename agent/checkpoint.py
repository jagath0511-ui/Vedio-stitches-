"""Crash-safe JSON checkpoint persistence and resume helpers."""

import json
import os
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from .schemas import Checkpoint


class CheckpointStore:
    def __init__(self, directory: Path) -> None:
        self.directory = Path(directory)
        self.directory.mkdir(parents=True, exist_ok=True)

    def _path(self, job_id: str) -> Path:
        return self.directory / (job_id + ".json")

    def save(self, checkpoint: Checkpoint) -> None:
        payload = asdict(checkpoint)
        payload["created_at"] = checkpoint.created_at.isoformat()
        target = self._path(checkpoint.job_id)
        temporary = target.with_suffix(".tmp")
        temporary.write_text(json.dumps(payload, sort_keys=True), encoding="utf-8")
        os.replace(str(temporary), str(target))

    def load(self, job_id: str) -> Optional[Checkpoint]:
        target = self._path(job_id)
        if not target.exists():
            return None
        try:
            payload = json.loads(target.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ValueError(f"invalid checkpoint for {job_id}") from error
        payload["created_at"] = datetime.fromisoformat(payload["created_at"])
        return Checkpoint(**payload)

    def clear(self, job_id: str) -> None:
        self._path(job_id).unlink(missing_ok=True)
