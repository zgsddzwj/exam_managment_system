from django.db import models
from django.contrib.auth import get_user_model
from classes.models import Class

User = get_user_model()


class Task(models.Model):
    """任务模型"""
    
    LANGUAGE_CHOICES = [
        ("java", "Java"),
        ("python", "Python"),
    ]
    
    title = models.CharField(max_length=200, verbose_name="任务标题")
    description = models.TextField(verbose_name="任务描述")
    language = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        verbose_name="编程语言"
    )
    class_obj = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name="tasks",
        verbose_name="所属班级"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_tasks",
        verbose_name="创建者"
    )
    deadline = models.DateTimeField(null=True, blank=True, verbose_name="截止时间")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    is_active = models.BooleanField(default=True, verbose_name="是否激活")
    
    class Meta:
        verbose_name = "任务"
        verbose_name_plural = "任务"
        db_table = "tasks"
        ordering = ["-created_at"]
    
    def __str__(self):
        return self.title


class TestCase(models.Model):
    """测试用例模型"""
    
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="test_cases",
        verbose_name="所属任务"
    )
    input_data = models.TextField(verbose_name="输入数据")
    expected_output = models.TextField(verbose_name="期望输出")
    is_hidden = models.BooleanField(default=False, verbose_name="是否隐藏测试")
    order = models.IntegerField(default=0, verbose_name="排序")
    weight = models.FloatField(default=1.0, verbose_name="权重")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    
    class Meta:
        verbose_name = "测试用例"
        verbose_name_plural = "测试用例"
        db_table = "test_cases"
        ordering = ["order", "id"]
    
    def __str__(self):
        return f"{self.task.title} - Test Case {self.order}"
