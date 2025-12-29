from django.contrib import admin
from .models import Class, InvitationCode


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ["name", "teacher", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["name", "teacher__username"]


@admin.register(InvitationCode)
class InvitationCodeAdmin(admin.ModelAdmin):
    list_display = ["code", "class_obj", "is_active", "current_uses", "max_uses", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["code", "class_obj__name"]
