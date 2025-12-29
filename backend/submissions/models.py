from django.db import models
from django.contrib.auth import get_user_model
from tasks.models import Task, TestCase

User = get_user_model()


class Submission(models.Model):
    """提交模型"""
    
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="submissions",
        verbose_name="任务"
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="submissions",
        verbose_name="学生"
    )
    code_content = models.TextField(verbose_name="代码内容")
    language = models.CharField(max_length=10, verbose_name="编程语言")
    score = models.FloatField(default=0.0, verbose_name="得分")
    test_count = models.IntegerField(default=0, verbose_name="测试次数")
    total_time = models.FloatField(default=0.0, verbose_name="总耗时（秒）")
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name="提交时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
    class Meta:
        verbose_name = "提交"
        verbose_name_plural = "提交"
        db_table = "submissions"
        ordering = ["-submitted_at"]
        unique_together = [["task", "student"]]
    
    def __str__(self):
        return f"{self.student.username} - {self.task.title}"


class TestResult(models.Model):
    """测试结果模型"""
    
    submission = models.ForeignKey(
        Submission,
        on_delete=models.CASCADE,
        related_name="test_results",
        verbose_name="提交"
    )
    test_case = models.ForeignKey(
        TestCase,
        on_delete=models.CASCADE,
        related_name="test_results",
        verbose_name="测试用例"
    )
    passed = models.BooleanField(default=False, verbose_name="是否通过")
    output = models.TextField(blank=True, null=True, verbose_name="输出")
    error_message = models.TextField(blank=True, null=True, verbose_name="错误信息")
    execution_time = models.FloatField(default=0.0, verbose_name="执行时间（秒）")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    
    class Meta:
        verbose_name = "测试结果"
        verbose_name_plural = "测试结果"
        db_table = "test_results"
    
    def __str__(self):
        return f"{self.submission} - Test Case {self.test_case.id} - {'通过' if self.passed else '失败'}"


class TestAttempt(models.Model):
    """测试尝试记录（用于统计测试次数）"""
    
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="test_attempts",
        verbose_name="任务"
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="test_attempts",
        verbose_name="学生"
    )
    code_content = models.TextField(verbose_name="代码内容")
    language = models.CharField(max_length=10, verbose_name="编程语言")
    test_results = models.JSONField(default=dict, verbose_name="测试结果")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="测试时间")
    
    class Meta:
        verbose_name = "测试尝试"
        verbose_name_plural = "测试尝试"
        db_table = "test_attempts"
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"{self.student.username} - {self.task.title} - {self.created_at}"
