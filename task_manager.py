"""Simple CLI task manager."""

from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import List, Optional


@dataclass
class Task:
    id: int
    title: str
    done: bool = False
    priority: str = "medium"  # low | medium | high
    due_date: Optional[str] = None  # YYYY-MM-DD
    tags: List[str] = field(default_factory=list)


class TaskManager:
    def __init__(self, storage_path: str = "tasks.json"):
        self.storage_path = Path(storage_path)
        self.tasks: List[Task] = []
        self._next_id: int = 1
        self._load()

    # ------------------------------------------------------------------
    # Storage
    # ------------------------------------------------------------------

    def _load(self) -> None:
        if self.storage_path.exists():
            data = json.loads(self.storage_path.read_text())
            self.tasks = [Task(**t) for t in data["tasks"]]
            self._next_id = data.get("next_id", len(self.tasks) + 1)

    def save(self) -> None:
        payload = {
            "next_id": self._next_id,
            "tasks": [t.__dict__ for t in self.tasks],
        }
        self.storage_path.write_text(json.dumps(payload, indent=2))

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    def add(self, title: str, priority: str = "medium", due_date: Optional[str] = None, tags: Optional[List[str]] = None) -> Task:
        # TODO: validate due_date format (must be YYYY-MM-DD and not in the past)
        task = Task(
            id=self._next_id,
            title=title,
            priority=priority,
            due_date=due_date,
            tags=tags or [],
        )
        self.tasks.append(task)
        self._next_id += 1
        return task

    def complete(self, task_id: int) -> bool:
        task = self._get(task_id)
        if task is None:
            return False
        task.done = True
        return True

    def delete(self, task_id: int) -> bool:
        task = self._get(task_id)
        if task is None:
            return False
        self.tasks.remove(task)
        return True

    def _get(self, task_id: int) -> Optional[Task]:
        return next((t for t in self.tasks if t.id == task_id), None)

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def search(self, keyword: str) -> List[Task]:
        # TODO: implement case-insensitive keyword search across title and tags
        pass

    def by_priority(self) -> List[Task]:
        # TODO: return tasks sorted high → medium → low
        pass

    def overdue(self) -> List[Task]:
        """Return incomplete tasks whose due_date is before today."""
        today = date.today().isoformat()
        return [
            t for t in self.tasks
            if not t.done and t.due_date is not None and t.due_date < today
        ]

    def export_csv(self, path: str) -> None:
        # TODO: export all tasks to a CSV file at `path`
        pass

    # ------------------------------------------------------------------
    # Display
    # ------------------------------------------------------------------

    def list_all(self) -> List[Task]:
        return list(self.tasks)
