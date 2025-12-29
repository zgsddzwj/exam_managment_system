from rest_framework import permissions


class IsTeacherOrAdmin(permissions.BasePermission):
    """检查用户是否为教师或管理员"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_teacher or request.user.is_admin)
        )

