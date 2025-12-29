from django.contrib import admin
from .models import Submission, TestResult, TestAttempt


class TestResultInline(admin.TabularInline):
    model = TestResult
    extra = 0
    readonly_fields = ["test_case", "passed", "output", "error_message", "execution_time"]


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ["student", "task", "language", "score", "test_count", "submitted_at"]
    list_filter = ["language", "submitted_at"]
    search_fields = ["student__username", "task__title"]
    readonly_fields = ["submitted_at", "updated_at"]
    inlines = [TestResultInline]


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ["submission", "test_case", "passed", "execution_time", "created_at"]
    list_filter = ["passed", "created_at"]
    readonly_fields = ["created_at"]


@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ["student", "task", "language", "created_at"]
    list_filter = ["language", "created_at"]
    search_fields = ["student__username", "task__title"]
    readonly_fields = ["created_at"]
