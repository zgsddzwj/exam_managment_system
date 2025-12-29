import multiprocessing

bind = "127.0.0.1:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50
preload_app = True
daemon = False
pidfile = "/root/project/backend/gunicorn.pid"
accesslog = "/root/project/backend/logs/gunicorn_access.log"
errorlog = "/root/project/backend/logs/gunicorn_error.log"
loglevel = "info"

