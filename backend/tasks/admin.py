from django.contrib import admin
from .models import Task, TestCase


class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "class_obj", "language", "created_by", "is_active", "created_at"]
    list_filter = ["language", "is_active", "created_at"]
    search_fields = ["title", "description"]
    inlines = [TestCaseInline]


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ["task", "order", "is_hidden", "weight", "created_at"]
    list_filter = ["is_hidden", "created_at"]
    search_fields = ["task__title"]
