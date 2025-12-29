from django.urls import path
from .views import (
    TaskListCreateView,
    TaskDetailView,
    student_task_list,
    student_task_detail,
)

app_name = "tasks"

urlpatterns = [
    path("", TaskListCreateView.as_view(), name="task_list_create"),
    path("<int:pk>/", TaskDetailView.as_view(), name="task_detail"),
    path("student/", student_task_list, name="student_task_list"),
    path("student/<int:task_id>/", student_task_detail, name="student_task_detail"),
]

