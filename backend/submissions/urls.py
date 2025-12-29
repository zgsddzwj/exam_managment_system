from django.urls import path
from .views import (
    test_code,
    submit_code,
    my_submissions,
    submission_detail,
    class_submissions,
    export_grades,
    get_code_analysis,
)

app_name = "submissions"

urlpatterns = [
    path("tasks/<int:task_id>/test/", test_code, name="test_code"),
    path("tasks/<int:task_id>/submit/", submit_code, name="submit_code"),
    path("tasks/<int:task_id>/analysis/", get_code_analysis, name="get_code_analysis"),
    path("my/", my_submissions, name="my_submissions"),
    path("classes/<int:class_id>/", class_submissions, name="class_submissions"),
    path("export/", export_grades, name="export_grades"),  # 必须在<int:submission_id>之前
    path("<int:submission_id>/", submission_detail, name="submission_detail"),
]

