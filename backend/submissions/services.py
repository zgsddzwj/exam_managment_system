"""代码执行服务，集成Judge0 API"""
import requests
import time
from django.conf import settings
from typing import Dict, List, Optional


class CodeExecutionService:
    """代码执行服务类"""
    
    LANGUAGE_IDS = {
        "java": 62,  # Java (OpenJDK 13.0.1)
        "python": 71,  # Python (3.8.1)
    }
    
    def __init__(self):
        self.api_url = settings.JUDGE0_API_URL
        self.api_key = settings.JUDGE0_API_KEY
        self.rapidapi_host = settings.JUDGE0_RAPIDAPI_HOST
        # 如果是Judge0 CE公共实例（ce.judge0.com），不需要API key
        self.is_rapidapi = "rapidapi.com" in self.api_url.lower()
    
    def _get_headers(self):
        """获取请求头"""
        headers = {
            "Content-Type": "application/json",
        }
        # RapidAPI模式需要API key和Host头
        if self.is_rapidapi:
            if self.api_key:
                headers["X-RapidAPI-Key"] = self.api_key
                headers["X-RapidAPI-Host"] = self.rapidapi_host
            else:
                # RapidAPI模式但缺少API key
                raise ValueError("使用RapidAPI模式需要配置JUDGE0_API_KEY环境变量")
        # Judge0 CE公共实例不需要认证头
        return headers
    
    def execute_code(
        self,
        source_code: str,
        language: str,
        stdin: str = "",
        expected_output: Optional[str] = None,
        cpu_time_limit: int = 2,
        memory_limit: int = 128000,
    ) -> Dict:
        """
        执行代码
        
        Args:
            source_code: 源代码
            language: 编程语言 (java, python)
            stdin: 标准输入
            expected_output: 期望输出（可选）
            cpu_time_limit: CPU时间限制（秒）
            memory_limit: 内存限制（KB）
        
        Returns:
            执行结果字典
        """
        language_id = self.LANGUAGE_IDS.get(language.lower())
        if not language_id:
            return {
                "success": False,
                "error": f"不支持的语言: {language}",
            }
        
        # 准备提交数据
        submission_data = {
            "source_code": source_code,
            "language_id": language_id,
            "stdin": stdin,
            "cpu_time_limit": cpu_time_limit,
            "memory_limit": memory_limit,
        }
        
        if expected_output:
            submission_data["expected_output"] = expected_output
        
        try:
            # 获取请求头
            try:
                headers = self._get_headers()
            except ValueError as e:
                return {
                    "success": False,
                    "error": str(e),
                    "details": "请配置JUDGE0_API_KEY环境变量，或使用Judge0 CE公共实例（设置JUDGE0_API_URL=https://ce.judge0.com）。",
                }
            
            # 提交代码
            response = requests.post(
                f"{self.api_url}/submissions",
                json=submission_data,
                headers=headers,
                timeout=30,
            )
            
            if response.status_code == 401:
                return {
                    "success": False,
                    "error": "Judge0 API认证失败",
                    "details": "如果使用RapidAPI，请检查JUDGE0_API_KEY是否正确。访问https://rapidapi.com/judge0-official/api/judge0-ce获取有效的API key。如需使用免费的Judge0 CE公共实例，请将JUDGE0_API_URL设置为https://ce.judge0.com并清除JUDGE0_API_KEY。",
                }
            
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": f"API请求失败: {response.status_code}",
                    "details": response.text,
                }
            
            token = response.json().get("token")
            if not token:
                return {
                    "success": False,
                    "error": "未获取到执行token",
                }
            
            # 轮询获取结果
            max_attempts = 30
            attempt = 0
            
            while attempt < max_attempts:
                time.sleep(1)
                result_response = requests.get(
                    f"{self.api_url}/submissions/{token}",
                    headers=self._get_headers(),
                    timeout=10,
                )
                
                if result_response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"获取结果失败: {result_response.status_code}",
                    }
                
                result = result_response.json()
                status_id = result.get("status", {}).get("id")
                
                # 状态ID: 1=排队中, 2=处理中, 3=已完成
                if status_id == 3:
                    # 执行完成
                    return self._parse_result(result, expected_output)
                elif status_id in [4, 5, 6, 7, 8, 9, 10, 11, 12]:
                    # 错误状态
                    return {
                        "success": False,
                        "error": result.get("status", {}).get("description", "执行失败"),
                        "status_id": status_id,
                        "stdout": result.get("stdout", ""),
                        "stderr": result.get("stderr", ""),
                    }
                
                attempt += 1
            
            return {
                "success": False,
                "error": "执行超时",
            }
        
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"网络请求异常: {str(e)}",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"执行异常: {str(e)}",
            }
    
    def _parse_result(self, result: Dict, expected_output: Optional[str] = None) -> Dict:
        """解析执行结果"""
        stdout = result.get("stdout", "")
        stderr = result.get("stderr", "")
        compile_output = result.get("compile_output", "")
        time_used = result.get("time", "")
        memory_used = result.get("memory", "")
        
        # 清理输出（去除末尾换行）
        stdout = stdout.rstrip() if stdout else ""
        expected_output = expected_output.rstrip() if expected_output else ""
        
        # 判断是否通过
        passed = False
        if expected_output:
            passed = stdout == expected_output
        else:
            # 如果没有期望输出，只要没有错误就算通过
            passed = not stderr and not compile_output
        
        return {
            "success": True,
            "passed": passed,
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": compile_output,
            "time_used": time_used,
            "memory_used": memory_used,
            "expected_output": expected_output,
        }
    
    def test_code(
        self,
        source_code: str,
        language: str,
        test_cases: List[Dict],
    ) -> List[Dict]:
        """
        测试代码（运行多个测试用例）
        
        Args:
            source_code: 源代码
            language: 编程语言
            test_cases: 测试用例列表，每个包含 input_data 和 expected_output
        
        Returns:
            测试结果列表
        """
        results = []
        
        for test_case in test_cases:
            result = self.execute_code(
                source_code=source_code,
                language=language,
                stdin=test_case.get("input_data", ""),
                expected_output=test_case.get("expected_output", ""),
            )
            results.append({
                **result,
                "test_case_id": test_case.get("id"),
                "input_data": test_case.get("input_data", ""),
            })
        
        return results

