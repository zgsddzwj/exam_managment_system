from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """自定义用户模型，扩展Django默认User"""
    
    ROLE_CHOICES = [
        ("admin", "管理员"),
        ("teacher", "教师"),
        ("student", "学生"),
    ]
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="student",
        verbose_name="角色"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
    class Meta:
        verbose_name = "用户"
        verbose_name_plural = "用户"
        db_table = "users"
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == "admin"
    
    @property
    def is_teacher(self):
        return self.role == "teacher"
    
    @property
    def is_student(self):
        return self.role == "student"
