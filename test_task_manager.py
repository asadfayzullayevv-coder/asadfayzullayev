"""Tests for TaskManager.search()."""

import pytest
from task_manager import TaskManager


@pytest.fixture
def mgr(tmp_path):
    m = TaskManager(storage_path=str(tmp_path / "tasks.json"))
    m.add("Buy groceries", tags=["errands", "shopping"])
    m.add("Fix login bug", tags=["backend", "urgent"])
    m.add("Write blog post", tags=["writing"])
    m.add("Review pull request", tags=["backend"])
    return m


def test_search_by_title(mgr):
    results = mgr.search("blog")
    assert len(results) == 1
    assert results[0].title == "Write blog post"


def test_search_case_insensitive(mgr):
    assert mgr.search("BUY") == mgr.search("buy")
    assert len(mgr.search("BUY")) == 1


def test_search_by_tag(mgr):
    results = mgr.search("backend")
    titles = {t.title for t in results}
    assert titles == {"Fix login bug", "Review pull request"}


def test_search_no_match(mgr):
    assert mgr.search("nonexistent") == []


def test_search_partial_match(mgr):
    results = mgr.search("pull")
    assert len(results) == 1
    assert results[0].title == "Review pull request"


def test_search_tag_case_insensitive(mgr):
    assert mgr.search("ERRANDS") == mgr.search("errands")
    assert len(mgr.search("ERRANDS")) == 1
