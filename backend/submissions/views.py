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
import requests
import json


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
            solution_mode=task.solution_mode,
            function_name=task.function_name,
            template_code=task.template_code,
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
            solution_mode=task.solution_mode,
            function_name=task.function_name,
            template_code=task.template_code,
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


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def get_code_analysis(request, task_id):
    """获取代码解析（使用DeepSeek Coder分析问题思路）"""
    user = request.user
    
    if not user.is_student:
        return Response({"error": "只有学生可以查看解析"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        task = Task.objects.get(id=task_id, is_active=True)
    except Task.DoesNotExist:
        return Response({"error": "任务不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    # 检查学生是否在该班级
    if not user.joined_classes.filter(id=task.class_obj.id).exists():
        return Response({"error": "您没有权限访问此任务"}, status=status.HTTP_403_FORBIDDEN)
    
    # 获取学生提交的代码
    code_content = request.data.get("code_content", "")
    if not code_content:
        return Response({"error": "代码内容不能为空"}, status=status.HTTP_400_BAD_REQUEST)
    
    # 构建prompt
    # 获取测试用例信息
    test_cases = task.test_cases.filter(is_hidden=False).order_by("order")[:3]  # 只显示前3个测试用例
    test_examples = []
    for tc in test_cases:
        test_examples.append(f"输入: {tc.input_data}\n输出: {tc.expected_output}")
    
    language_name = "Python" if task.language == "python" else "Java"
    
    prompt = f"""你是一位经验丰富的编程教师。请分析以下编程题目和学生当前的解答，给出详细的解题思路和关键代码逻辑，但不要给出完整可运行的代码。

题目名称: {task.title}

题目描述:
{task.description}

编程语言: {language_name}

函数/方法签名:
"""
    
    if task.function_name:
        if task.language == "python":
            prompt += f"def {task.function_name}(参数):\n"
        else:
            prompt += f"public static int {task.function_name}(参数) {{}}\n"
    else:
        prompt += "（学生需要实现的方法）\n"
    
    if test_examples:
        prompt += f"""
测试用例示例:
{chr(10).join(f'{i+1}. {ex}' for i, ex in enumerate(test_examples))}
"""
    
    prompt += f"""

学生当前的代码:
```{task.language}
{code_content}
```

请按以下格式给出详细的解析（可以用代码片段说明逻辑，但不要给完整可运行的代码）：

1. **题目分析**
   - 核心要求：简要说明题目要解决什么问题
   - 输入输出：说明输入参数的含义和输出要求
   - 约束条件：说明需要注意的限制条件

2. **解题思路**
   - 关键观察：需要注意到哪些关键点
   - 算法/方法选择：应该用什么方法来解决（如：循环、递归、双指针、哈希表等）
   - 步骤分解：将解题过程分解为几个关键步骤，说明每一步要做什么
   - 边界情况：哪些特殊情况需要处理

3. **关键代码逻辑（用伪代码或代码片段说明）**
   - 可以用类似这样的方式说明逻辑：
     ```
     // 步骤1：判断边界条件
     if (条件) {{ 
         return 结果;
     }}
     
     // 步骤2：初始化变量
     int 变量名 = 初始值;
     
     // 步骤3：循环处理
     while (循环条件) {{
         // 具体操作逻辑说明
     }}
     ```
   - 注意：只给关键的逻辑片段，不要给完整的方法实现
   - 可以用注释说明每个步骤的作用，但不要补全所有代码

4. **当前代码分析**
   - 思路正确性：学生的思路是否正确
   - 代码问题：指出代码中的具体问题（参数名错误、类型错误、逻辑错误等）
   - 遗漏部分：是否遗漏了某些重要步骤
   - 改进方向：应该如何修改（用伪代码或代码片段说明，不要给完整代码）

5. **提示与建议**
   - 常见陷阱：提醒学生容易犯的错误
   - 调试建议：如果代码有错误，如何定位问题
   - 学习建议：推荐相关的知识点或类似题目

**重要要求**：
- 可以用代码片段和伪代码来说明逻辑，但要确保不能直接复制粘贴运行
- 代码片段应该是局部的、不完整的，需要学生补充关键部分
- 用中文回答，语气友好、鼓励学生思考
- 不要给出完整可运行的代码实现
- 关键逻辑可以用注释+代码片段的方式展示，但必须是不完整的
"""
    
    # 调用DeepSeek API（增加超时时间和重试机制）
    deepseek_url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-2ea43627c4fa4324a4c7631d64551be6"
    }
    
    payload = {
        "model": "deepseek-coder",
        "messages": [
            {
                "role": "system",
                "content": "你是一位经验丰富的编程教师，擅长用清晰易懂的方式解释编程思路。你的职责是：\n1. 给出详细的解题思路和关键代码逻辑\n2. 可以用代码片段和伪代码来说明，但这些片段必须是不完整的、不能直接运行的\n3. 不要给出完整可运行的代码实现，避免学生直接抄袭\n4. 用中文回答，语气友好，鼓励学生思考和学习"
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1500  # 减少token数量以加快响应速度，降低超时风险
    }
    
    # 重试机制：最多尝试3次
    max_retries = 3
    last_exception = None
    
    for attempt in range(max_retries):
        # 连接超时15秒，读取超时随重试次数递增（AI生成内容需要较长时间）
        # 每次重试时增加超时时间：第一次120秒，第二次150秒，第三次180秒
        read_timeout = 120 + (attempt * 30)
        try:
            response = requests.post(
                deepseek_url, 
                headers=headers, 
                json=payload, 
                timeout=(15, read_timeout)  # (connect_timeout, read_timeout)
            )
            
            if response.status_code != 200:
                error_msg = f"AI服务返回错误 (状态码: {response.status_code})"
                if attempt < max_retries - 1:
                    continue  # 重试
                return Response({
                    "error": error_msg,
                    "details": response.text[:200] if len(response.text) > 200 else response.text
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            result = response.json()
            analysis_content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not analysis_content:
                if attempt < max_retries - 1:
                    continue  # 重试
                return Response({
                    "error": "未能获取解析内容，请稍后重试"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                "success": True,
                "analysis": analysis_content
            })
            
        except requests.exceptions.Timeout as e:
            last_exception = e
            if attempt < max_retries - 1:
                # 等待3秒后重试，给服务器一些恢复时间
                import time
                time.sleep(3 * (attempt + 1))  # 递增等待时间：3秒、6秒、9秒
                continue
            # 最后一次尝试失败
            timeout_type = "连接超时" if "ConnectTimeout" in str(e) or "timed out" in str(e).lower() else "读取超时"
            return Response({
                "error": f"AI服务响应{timeout_type}，已重试{max_retries}次仍失败。可能是网络连接不稳定或AI服务繁忙，请稍后重试。",
                "details": f"超时时间: {read_timeout}秒。错误详情: {str(e)[:100]}"
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
            
        except requests.exceptions.RequestException as e:
            last_exception = e
            if attempt < max_retries - 1:
                import time
                time.sleep(3 * (attempt + 1))  # 递增等待时间：3秒、6秒、9秒
                continue
            return Response({
                "error": f"AI服务请求失败，已重试{max_retries}次。可能是网络连接问题，请检查网络或稍后重试。",
                "details": str(e)[:200]  # 限制错误详情长度
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except Exception as e:
            last_exception = e
            if attempt < max_retries - 1:
                import time
                time.sleep(3 * (attempt + 1))  # 递增等待时间：3秒、6秒、9秒
                continue
            return Response({
                "error": f"处理失败: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # 如果所有重试都失败了
    return Response({
        "error": f"AI服务请求失败，已重试{max_retries}次。请稍后重试。",
        "details": str(last_exception) if last_exception else "未知错误"
    }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


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
    # 从查询参数获取过滤条件
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
            response = export_submissions_to_csv(class_id=class_id, task_id=task_id)
        else:
            response = export_submissions_to_excel(class_id=class_id, task_id=task_id)
        
        # 确保响应不被DRF的渲染器处理
        response._is_rendered = True
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        from rest_framework.response import Response
        from rest_framework import status
        return Response(
            {"error": f"导出失败: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
