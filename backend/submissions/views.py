from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Submission, TestResult, TestAttempt
from .serializers import (
    SubmissionSerializer,
    SubmissionDetailSerializer,
    TestCodeSerializer,
    SubmitCodeSerializer,
)
from tasks.models import Task, TestCase
from .services import CodeExecutionService
from .export import export_submissions_to_excel, export_submissions_to_csv
from users.permissions import IsTeacherOrAdmin

import time


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def test_code(request, task_id):
    """测试代码（不保存提交）"""
    user = request.user
    
    if not user.is_student:
        return Response({"error": "只有学生可以测试代码"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        task = Task.objects.get(id=task_id, is_active=True)
    except Task.DoesNotExist:
        return Response({"error": "任务不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    # 检查学生是否在该班级
    if not user.joined_classes.filter(id=task.class_obj.id).exists():
        return Response({"error": "您没有权限访问此任务"}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = TestCodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    code_content = serializer.validated_data["code_content"]
    language = serializer.validated_data["language"]
    
    # 验证语言匹配
    if language != task.language:
        return Response(
            {"error": f"任务要求使用{dict(Task.LANGUAGE_CHOICES).get(task.language, task.language)}，但提交的是{language}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 获取测试用例（只获取非隐藏的）
    test_cases = task.test_cases.filter(is_hidden=False).order_by("order")
    
    if not test_cases.exists():
        return Response({"error": "该任务没有测试用例"}, status=status.HTTP_400_BAD_REQUEST)
    
    # 执行代码测试
    execution_service = CodeExecutionService()
    start_time = time.time()
    
    test_results = []
    for test_case in test_cases:
        result = execution_service.execute_code(
            source_code=code_content,
            language=language,
            stdin=test_case.input_data,
            expected_output=test_case.expected_output,
        )
        
        test_results.append({
            "test_case_id": test_case.id,
            "input_data": test_case.input_data,
            "expected_output": test_case.expected_output,
            **result,
        })
    
    total_time = time.time() - start_time
    
    # 记录测试尝试
    TestAttempt.objects.create(
        task=task,
        student=user,
        code_content=code_content,
        language=language,
        test_results={"results": test_results},
    )
    
    # 计算通过数
    passed_count = sum(1 for r in test_results if r.get("passed", False))
    total_count = len(test_results)
    
    return Response({
        "success": True,
        "test_results": test_results,
        "passed_count": passed_count,
        "total_count": total_count,
        "total_time": total_time,
    })


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def submit_code(request, task_id):
    """提交代码（保存并评分）"""
    user = request.user
    
    if not user.is_student:
        return Response({"error": "只有学生可以提交代码"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        task = Task.objects.get(id=task_id, is_active=True)
    except Task.DoesNotExist:
        return Response({"error": "任务不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    # 检查学生是否在该班级
    if not user.joined_classes.filter(id=task.class_obj.id).exists():
        return Response({"error": "您没有权限访问此任务"}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = SubmitCodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    code_content = serializer.validated_data["code_content"]
    language = serializer.validated_data["language"]
    
    # 验证语言匹配
    if language != task.language:
        return Response(
            {"error": f"任务要求使用{dict(Task.LANGUAGE_CHOICES).get(task.language, task.language)}，但提交的是{language}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 获取所有测试用例（包括隐藏的）
    test_cases = task.test_cases.all().order_by("order")
    
    if not test_cases.exists():
        return Response({"error": "该任务没有测试用例"}, status=status.HTTP_400_BAD_REQUEST)
    
    # 执行代码测试
    execution_service = CodeExecutionService()
    start_time = time.time()
    
    test_results_data = []
    total_weight = 0.0
    passed_weight = 0.0
    
    for test_case in test_cases:
        result = execution_service.execute_code(
            source_code=code_content,
            language=language,
            stdin=test_case.input_data,
            expected_output=test_case.expected_output,
        )
        
        passed = result.get("passed", False)
        total_weight += test_case.weight
        if passed:
            passed_weight += test_case.weight
        
        test_results_data.append({
            "test_case": test_case,
            "passed": passed,
            "output": result.get("stdout", ""),
            "error_message": result.get("stderr") or result.get("compile_output") or result.get("error", ""),
            "execution_time": float(result.get("time_used", 0)) or 0.0,
        })
    
    total_time = time.time() - start_time
    
    # 计算分数
    if total_weight > 0:
        score = (passed_weight / total_weight) * 100
    else:
        score = 0.0
    
    # 获取测试次数
    test_count = TestAttempt.objects.filter(task=task, student=user).count()
    
    # 创建或更新提交
    submission, created = Submission.objects.update_or_create(
        task=task,
        student=user,
        defaults={
            "code_content": code_content,
            "language": language,
            "score": score,
            "test_count": test_count,
            "total_time": total_time,
        }
    )
    
    # 删除旧的测试结果
    submission.test_results.all().delete()
    
    # 创建新的测试结果
    for result_data in test_results_data:
        TestResult.objects.create(
            submission=submission,
            test_case=result_data["test_case"],
            passed=result_data["passed"],
            output=result_data["output"],
            error_message=result_data["error_message"],
            execution_time=result_data["execution_time"],
        )
    
    serializer = SubmissionDetailSerializer(submission)
    return Response({
        "message": "提交成功",
        "submission": serializer.data,
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def my_submissions(request):
    """获取当前用户的提交列表"""
    user = request.user
    
    if user.is_student:
        submissions = Submission.objects.filter(student=user)
    elif user.is_teacher:
        # 教师可以看到自己班级的所有提交
        submissions = Submission.objects.filter(task__class_obj__teacher=user)
    else:
        # 管理员可以看到所有提交
        submissions = Submission.objects.all()
    
    task_id = request.query_params.get("task_id")
    if task_id:
        submissions = submissions.filter(task_id=task_id)
    
    serializer = SubmissionSerializer(submissions, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def submission_detail(request, submission_id):
    """获取提交详情"""
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return Response({"error": "提交不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    
    # 权限检查
    if user.is_student and submission.student != user:
        return Response({"error": "无权限"}, status=status.HTTP_403_FORBIDDEN)
    elif user.is_teacher and submission.task.class_obj.teacher != user:
        return Response({"error": "无权限"}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = SubmissionDetailSerializer(submission)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsTeacherOrAdmin])
def class_submissions(request, class_id):
    """获取班级的所有提交（教师/管理员）"""
    task_id = request.query_params.get("task_id")
    
    submissions = Submission.objects.filter(task__class_obj_id=class_id)
    
    if task_id:
        submissions = submissions.filter(task_id=task_id)
    
    serializer = SubmissionSerializer(submissions, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsTeacherOrAdmin])
def export_grades(request):
    """导出成绩（Excel或CSV）"""
    class_id = request.query_params.get("class_id")
    task_id = request.query_params.get("task_id")
    format_type = request.query_params.get("format", "excel")  # excel or csv
    
    # 转换为整数类型（如果提供了值）
    try:
        class_id = int(class_id) if class_id else None
    except (ValueError, TypeError):
        class_id = None
    
    try:
        task_id = int(task_id) if task_id else None
    except (ValueError, TypeError):
        task_id = None
    
    try:
        if format_type == "csv":
            return export_submissions_to_csv(class_id=class_id, task_id=task_id)
        else:
            return export_submissions_to_excel(class_id=class_id, task_id=task_id)
    except Exception as e:
        from rest_framework.response import Response
        from rest_framework import status
        return Response(
            {"error": f"导出失败: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
