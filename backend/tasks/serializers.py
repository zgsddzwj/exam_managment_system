from rest_framework import serializers
from .models import Task, TestCase


class TestCaseSerializer(serializers.ModelSerializer):
    """测试用例序列化器"""
    
    class Meta:
        model = TestCase
        fields = [
            "id", "input_data", "expected_output", "is_hidden",
            "order", "weight", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class TestCaseCreateSerializer(serializers.ModelSerializer):
    """创建测试用例序列化器"""
    
    class Meta:
        model = TestCase
        fields = [
            "input_data", "expected_output", "is_hidden",
            "order", "weight"
        ]


class TaskSerializer(serializers.ModelSerializer):
    """任务序列化器"""
    
    class_name = serializers.CharField(source="class_obj.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)
    test_case_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "language", "class_obj",
            "class_name", "created_by", "created_by_name", "deadline",
            "test_case_count", "is_active", "created_at", "updated_at",
            "solution_mode", "function_name", "template_code"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
    
    def get_test_case_count(self, obj):
        """获取测试用例数量"""
        if hasattr(obj, 'test_cases'):
            return obj.test_cases.count()
        return 0


class TaskDetailSerializer(serializers.ModelSerializer):
    """任务详情序列化器"""
    
    class_name = serializers.CharField(source="class_obj.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)
    test_cases = TestCaseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "language", "class_obj",
            "class_name", "created_by", "created_by_name", "deadline",
            "test_cases", "is_active", "created_at", "updated_at",
            "template_code", "function_name", "solution_mode"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TaskCreateSerializer(serializers.ModelSerializer):
    """创建任务序列化器"""
    
    test_cases = TestCaseCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Task
        fields = [
            "title", "description", "language", "class_obj",
            "deadline", "is_active", "test_cases",
            "template_code", "function_name", "solution_mode"
        ]
    
    def create(self, validated_data):
        test_cases_data = validated_data.pop("test_cases", [])
        task = Task.objects.create(**validated_data)
        
        for test_case_data in test_cases_data:
            TestCase.objects.create(task=task, **test_case_data)
        
        return task
    
    def update(self, instance, validated_data):
        test_cases_data = validated_data.pop("test_cases", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if test_cases_data is not None:
            # 删除旧的测试用例
            instance.test_cases.all().delete()
            # 创建新的测试用例
            for test_case_data in test_cases_data:
                TestCase.objects.create(task=instance, **test_case_data)
        
        return instance

