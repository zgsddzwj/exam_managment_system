from rest_framework import serializers
from .models import Submission, TestResult, TestAttempt
from tasks.serializers import TestCaseSerializer


class TestResultSerializer(serializers.ModelSerializer):
    """测试结果序列化器"""
    
    test_case_info = serializers.SerializerMethodField()
    
    class Meta:
        model = TestResult
        fields = [
            "id", "test_case", "test_case_info", "passed", "output",
            "error_message", "execution_time", "created_at"
        ]
        read_only_fields = ["id", "created_at"]
    
    def get_test_case_info(self, obj):
        if obj.test_case:
            return {
                "id": obj.test_case.id,
                "order": obj.test_case.order,
                "is_hidden": obj.test_case.is_hidden,
            }
        return None


class SubmissionSerializer(serializers.ModelSerializer):
    """提交序列化器"""
    
    student_name = serializers.CharField(source="student.username", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    
    class Meta:
        model = Submission
        fields = [
            "id", "task", "task_title", "student", "student_name",
            "code_content", "language", "score", "test_count",
            "total_time", "submitted_at", "updated_at"
        ]
        read_only_fields = ["id", "submitted_at", "updated_at"]


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """提交详情序列化器"""
    
    student_name = serializers.CharField(source="student.username", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    test_results = TestResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = Submission
        fields = [
            "id", "task", "task_title", "student", "student_name",
            "code_content", "language", "score", "test_count",
            "total_time", "test_results", "submitted_at", "updated_at"
        ]
        read_only_fields = ["id", "submitted_at", "updated_at"]


class TestCodeSerializer(serializers.Serializer):
    """测试代码序列化器"""
    
    code_content = serializers.CharField(required=True)
    language = serializers.ChoiceField(choices=["java", "python"], required=True)


class SubmitCodeSerializer(serializers.Serializer):
    """提交代码序列化器"""
    
    code_content = serializers.CharField(required=True)
    language = serializers.ChoiceField(choices=["java", "python"], required=True)

