"""成绩导出功能"""
import pandas as pd
from io import BytesIO
from django.http import HttpResponse
from .models import Submission
from tasks.models import Task

LANGUAGE_DISPLAY = {
    "java": "Java",
    "python": "Python",
}


def export_submissions_to_excel(class_id=None, task_id=None):
    """
    导出提交记录到Excel
    
    Args:
        class_id: 班级ID（可选）
        task_id: 任务ID（可选）
    
    Returns:
        HttpResponse with Excel file
    """
    # 获取提交记录
    submissions = Submission.objects.select_related("student", "task", "task__class_obj").all()
    
    # 添加权限过滤：只导出教师/管理员能看到的提交
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    if class_id:
        submissions = submissions.filter(task__class_obj_id=class_id)
    
    if task_id:
        submissions = submissions.filter(task_id=task_id)
    
    # 如果没有数据，返回空文件
    if not submissions.exists():
        # 创建一个空的DataFrame
        df = pd.DataFrame(columns=[
            "学生姓名", "学生邮箱", "班级名称", "任务标题",
            "编程语言", "得分", "测试次数", "总耗时(秒)", "提交时间"
        ])
        output = BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="成绩统计")
        output.seek(0)
        
        response = HttpResponse(
            output.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
        filename = "成绩统计.xlsx"
        if task_id:
            filename = f"任务_{task_id}_成绩统计.xlsx"
        elif class_id:
            filename = f"班级_{class_id}_成绩统计.xlsx"
        
        import urllib.parse
        encoded_filename = urllib.parse.quote(filename.encode('utf-8'))
        response["Content-Disposition"] = f'attachment; filename*=UTF-8\'\'{encoded_filename}'
        
        return response
    
    # 准备数据
    data = []
    for submission in submissions:
        data.append({
            "学生姓名": submission.student.username,
            "学生邮箱": submission.student.email,
            "班级名称": submission.task.class_obj.name,
            "任务标题": submission.task.title,
            "编程语言": LANGUAGE_DISPLAY.get(submission.language, submission.language),
            "得分": f"{submission.score:.2f}",
            "测试次数": submission.test_count,
            "总耗时(秒)": f"{submission.total_time:.2f}",
            "提交时间": submission.submitted_at.strftime("%Y-%m-%d %H:%M:%S"),
        })
    
    # 创建DataFrame
    df = pd.DataFrame(data)
    
    # 创建Excel文件
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="成绩统计")
    
    output.seek(0)
    
    # 创建HTTP响应
    response = HttpResponse(
        output.read(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    
    filename = "成绩统计.xlsx"
    if task_id:
        filename = f"任务_{task_id}_成绩统计.xlsx"
    elif class_id:
        filename = f"班级_{class_id}_成绩统计.xlsx"
    
    # 处理中文文件名编码
    import urllib.parse
    encoded_filename = urllib.parse.quote(filename.encode('utf-8'))
    response["Content-Disposition"] = f'attachment; filename*=UTF-8\'\'{encoded_filename}'
    
    return response


def export_submissions_to_csv(class_id=None, task_id=None):
    """
    导出提交记录到CSV
    
    Args:
        class_id: 班级ID（可选）
        task_id: 任务ID（可选）
    
    Returns:
        HttpResponse with CSV file
    """
    # 获取提交记录
    submissions = Submission.objects.select_related("student", "task", "task__class_obj").all()
    
    if class_id:
        submissions = submissions.filter(task__class_obj_id=class_id)
    
    if task_id:
        submissions = submissions.filter(task_id=task_id)
    
    # 准备数据
    data = []
    for submission in submissions:
        data.append({
            "学生姓名": submission.student.username,
            "学生邮箱": submission.student.email,
            "班级名称": submission.task.class_obj.name,
            "任务标题": submission.task.title,
            "编程语言": LANGUAGE_DISPLAY.get(submission.language, submission.language),
            "得分": f"{submission.score:.2f}",
            "测试次数": submission.test_count,
            "总耗时(秒)": f"{submission.total_time:.2f}",
            "提交时间": submission.submitted_at.strftime("%Y-%m-%d %H:%M:%S"),
        })
    
    # 创建DataFrame
    df = pd.DataFrame(data)
    
    # 创建CSV响应
    response = HttpResponse(content_type="text/csv; charset=utf-8-sig")
    
    filename = "成绩统计.csv"
    if class_id:
        filename = f"班级_{class_id}_成绩统计.csv"
    if task_id:
        filename = f"任务_{task_id}_成绩统计.csv"
    
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    
    df.to_csv(response, index=False, encoding="utf-8-sig")
    
    return response

