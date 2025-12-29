from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class Class(models.Model):
    """班级模型"""
    
    name = models.CharField(max_length=100, verbose_name="班级名称")
    description = models.TextField(blank=True, null=True, verbose_name="班级描述")
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_classes",
        verbose_name="创建教师"
    )
    students = models.ManyToManyField(
        User,
        related_name="joined_classes",
        blank=True,
        verbose_name="学生"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    
    class Meta:
        verbose_name = "班级"
        verbose_name_plural = "班级"
        db_table = "classes"
        ordering = ["-created_at"]
    
    def __str__(self):
        return self.name


class InvitationCode(models.Model):
    """邀请码模型"""
    
    code = models.CharField(max_length=20, unique=True, verbose_name="邀请码")
    class_obj = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name="invitation_codes",
        verbose_name="班级"
    )
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="过期时间")
    max_uses = models.IntegerField(default=0, verbose_name="最大使用次数（0表示无限制）")
    current_uses = models.IntegerField(default=0, verbose_name="当前使用次数")
    is_active = models.BooleanField(default=True, verbose_name="是否激活")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    
    class Meta:
        verbose_name = "邀请码"
        verbose_name_plural = "邀请码"
        db_table = "invitation_codes"
    
    def __str__(self):
        return f"{self.code} - {self.class_obj.name}"
    
    @classmethod
    def generate_code(cls):
        """生成唯一的邀请码"""
        while True:
            code = str(uuid.uuid4())[:8].upper()
            if not cls.objects.filter(code=code).exists():
                return code
    
    def can_use(self):
        """检查邀请码是否可以使用"""
        if not self.is_active:
            return False, "邀请码已失效"
        if self.expires_at and self.expires_at < timezone.now():
            return False, "邀请码已过期"
        if self.max_uses > 0 and self.current_uses >= self.max_uses:
            return False, "邀请码使用次数已达上限"
        return True, "可以使用"
    
    def use(self):
        """使用邀请码"""
        can_use, message = self.can_use()
        if can_use:
            self.current_uses += 1
            self.save()
            return True
        return False
