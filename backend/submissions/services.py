"""代码执行服务，集成Judge0 API"""
import requests
import time
import json
import re
import ast
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
    
    def _parse_input_data(self, input_data: str):
        """解析输入数据，支持多种格式"""
        if not input_data or not input_data.strip():
            return []
        
        # 尝试解析为JSON
        try:
            inputs = json.loads(input_data)
            if isinstance(inputs, list):
                return inputs
            elif isinstance(inputs, dict):
                # 如果是字典，转为列表
                return [inputs]
            else:
                return [inputs]
        except:
            pass
        
        # 尝试按行分割
        lines = [line.strip() for line in input_data.strip().split('\n') if line.strip()]
        if len(lines) > 1:
            # 多行输入，尝试转换每行的类型
            parsed = []
            for line in lines:
                # 尝试解析为数字
                try:
                    if '.' in line:
                        parsed.append(float(line))
                    else:
                        parsed.append(int(line))
                except:
                    # 保持为字符串
                    parsed.append(line)
            return parsed
        
        # 单行输入，按空格分割
        parts = input_data.strip().split()
        if len(parts) > 1:
            # 多个值，尝试转换类型
            parsed = []
            for part in parts:
                try:
                    if '.' in part:
                        parsed.append(float(part))
                    else:
                        parsed.append(int(part))
                except:
                    parsed.append(part)
            return parsed
        
        # 单个值
        try:
            if '.' in input_data:
                return [float(input_data)]
            else:
                return [int(input_data)]
        except:
            return [input_data]
    
    def _parse_input_data(self, input_data: str):
        """解析输入数据，支持多种格式"""
        if not input_data or not input_data.strip():
            return []
        
        # 尝试解析为JSON
        try:
            inputs = json.loads(input_data)
            if isinstance(inputs, list):
                return inputs
            elif isinstance(inputs, dict):
                # 如果是字典，转为列表
                return [inputs]
            else:
                return [inputs]
        except:
            pass
        
        # 尝试按行分割
        lines = [line.strip() for line in input_data.strip().split('\n') if line.strip()]
        if len(lines) > 1:
            # 多行输入，尝试转换每行的类型
            parsed = []
            for line in lines:
                # 尝试解析为数字
                try:
                    if '.' in line:
                        parsed.append(float(line))
                    else:
                        parsed.append(int(line))
                except:
                    # 保持为字符串
                    parsed.append(line)
            return parsed
        
        # 单行输入，按空格分割
        parts = input_data.strip().split()
        if len(parts) > 1:
            # 多个值，尝试转换类型
            parsed = []
            for part in parts:
                try:
                    if '.' in part:
                        parsed.append(float(part))
                    else:
                        parsed.append(int(part))
                except:
                    parsed.append(part)
            return parsed
        
        # 单个值
        try:
            if '.' in input_data:
                return [float(input_data)]
            else:
                return [int(input_data)]
        except:
            return [input_data]
    
    def _wrap_python_function(self, user_code: str, function_name: str, template_code: str, input_data: str) -> str:
        """包装Python函数为完整可执行程序（LeetCode风格）"""
        # 解析输入数据
        inputs = self._parse_input_data(input_data)
        
        # 如果有模板代码，使用模板；否则自动生成
        if template_code:
            # 在模板中查找占位符，如果没有则尝试替换函数体
            if "{{user_code}}" in template_code:
                wrapped = template_code.replace("{{user_code}}", user_code)
            elif f"def {function_name}" in template_code:
                # 替换模板中的函数定义
                pattern = f"def {function_name}[^:]*:.*?(?=\\n\\n|\\ndef |\\nclass |$)"
                wrapped = re.sub(pattern, user_code.strip(), template_code, flags=re.DOTALL)
            else:
                wrapped = template_code + "\n\n" + user_code
        else:
            # 自动生成包装代码
            wrapped = user_code + "\n\n"
        
        # 生成main函数来调用学生代码
        main_code = "\n# 自动生成的测试代码（使用老师设置的输入和输出）\n"
        main_code += "if __name__ == '__main__':\n"
        
        # 根据函数签名确定参数数量
        # 尝试从用户代码中提取函数参数
        function_match = re.search(rf'def\s+{re.escape(function_name)}\s*\(([^)]*)\)', wrapped)
        param_count = 0
        if function_match:
            params = function_match.group(1).strip()
            if params:
                # 计算参数数量（考虑默认值）
                param_count = len([p for p in params.split(',') if p.strip() and '=' not in p.strip()])
            
            # 根据参数数量调用函数
            if param_count == 0:
                main_code += f"    result = {function_name}()\n"
            elif param_count == 1:
                # 单个参数
                if len(inputs) > 0:
                    input_str = repr(inputs[0])
                    main_code += f"    result = {function_name}({input_str})\n"
                else:
                    main_code += f"    result = {function_name}(None)\n"
            elif param_count > 1:
                # 多个参数，使用输入数据填充
                if len(inputs) >= param_count:
                    args_str = ", ".join(repr(arg) for arg in inputs[:param_count])
                    main_code += f"    result = {function_name}({args_str})\n"
                else:
                    # 输入数据不足，用None填充
                    args_list = [repr(arg) for arg in inputs]
                    args_list.extend(["None"] * (param_count - len(inputs)))
                    args_str = ", ".join(args_list)
                    main_code += f"    result = {function_name}({args_str})\n"
        else:
            # 无法提取函数签名，根据输入数量推断
            if len(inputs) == 0:
                main_code += f"    result = {function_name}()\n"
            elif len(inputs) == 1:
                input_str = repr(inputs[0])
                main_code += f"    result = {function_name}({input_str})\n"
            else:
                args_str = ", ".join(repr(arg) for arg in inputs)
                main_code += f"    result = {function_name}({args_str})\n"
        
        main_code += "    if isinstance(result, (list, dict)):\n"
        main_code += "        print(json.dumps(result, ensure_ascii=False))\n"
        main_code += "    else:\n"
        main_code += "        print(result)\n"
        
        # 如果使用了json，确保导入
        if "json.dumps" in main_code or "json.loads" in main_code:
            if "import json" not in wrapped:
                wrapped = "import json\n" + wrapped
        
        return wrapped + main_code
    
    def _wrap_java_function(self, user_code: str, function_name: str, template_code: str, input_data: str, class_name: str = "Main") -> str:
        """包装Java函数为完整可执行程序（LeetCode风格）"""
        # 解析输入数据（使用统一的解析方法）
        inputs = self._parse_input_data(input_data)
        
        # 如果有模板代码，使用模板
        if template_code:
            if "{{user_code}}" in template_code:
                wrapped = template_code.replace("{{user_code}}", user_code)
            else:
                # 尝试在模板中找到方法定义并替换
                # 转义函数名中的特殊字符
                escaped_function_name = re.escape(function_name)
                # 使用原始字符串避免转义问题
                pattern = r"(public\s+(static\s+)?[^\s]+\s+" + escaped_function_name + r"\s*\([^\)]*\)[^{]*)\{\s*[^\}]*\}"
                wrapped = re.sub(pattern, lambda m: m.group(1) + "{\n" + user_code.strip() + "\n    }", template_code, flags=re.DOTALL)
        else:
            # 检查用户代码是否已经包含完整的类定义和main方法
            has_class_def = re.search(r'public\s+class\s+\w+', user_code)
            has_main = 'public static void main' in user_code
            if has_class_def and has_main:
                # 完整的可执行代码，直接使用（不包装）
                return user_code
            
            # 自动生成类和方法
            # Judge0要求类名必须是Main，否则会报编译错误（类名与文件名不匹配）
            wrapped = "import java.util.*;\nimport java.util.Arrays;\n\n"
            wrapped += "public class Main {\n"
            
            # 尝试从用户代码中提取方法签名和返回类型
            method_match = re.search(r'public\s+(static\s+)?([^\s]+)\s+(\w+)\s*\(([^)]*)\)', user_code)
            if method_match:
                is_static = method_match.group(1) is not None
                return_type = method_match.group(2)
                detected_function_name = method_match.group(3)
                params_str = method_match.group(4)
                
                # 提取方法体 - 使用更精确的匹配（匹配第一个{到对应的}）
                # 找到方法签名后的第一个{和对应的}
                method_start = method_match.end()
                brace_count = 0
                body_start = -1
                body_end = -1
                
                for i in range(method_start, len(user_code)):
                    if user_code[i] == '{':
                        if brace_count == 0:
                            body_start = i + 1
                        brace_count += 1
                    elif user_code[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            body_end = i
                            break
                
                if body_start != -1 and body_end != -1:
                    body = user_code[body_start:body_end].strip()
                    # 确保方法是static的
                    static_modifier = "static "
                    wrapped += f"    public {static_modifier}{return_type} {detected_function_name}({params_str}) {{\n"
                    # 添加缩进
                    body_lines = body.split('\n')
                    indented_body = '\n'.join('        ' + line.rstrip() for line in body_lines)
                    wrapped += indented_body + "\n    }\n"
                else:
                    # 无法精确提取方法体，尝试使用正则（作为后备）
                    body_match = re.search(r'\{(.*?)\}', user_code, re.DOTALL)
                    if body_match:
                        body = body_match.group(1).strip()
                        static_modifier = "static "
                        wrapped += f"    public {static_modifier}{return_type} {detected_function_name}({params_str}) {{\n"
                        body_lines = body.split('\n')
                        indented_body = '\n'.join('        ' + line.rstrip() for line in body_lines)
                        wrapped += indented_body + "\n    }\n"
                    else:
                        # 最后的后备方案：跳过方法签名行
                        static_modifier = "static "
                        wrapped += f"    public {static_modifier}{return_type} {detected_function_name}({params_str}) {{\n"
                        body_lines = user_code.strip().split('\n')
                        # 跳过方法签名行
                        body_lines = [line for line in body_lines if not re.match(r'^\s*public\s+.*\{?\s*$', line.strip())]
                        indented_body = '\n'.join('        ' + line.rstrip() for line in body_lines if line.strip())
                        wrapped += indented_body + "\n    }\n"
                function_name = detected_function_name  # 使用检测到的函数名
            else:
                # 如果没有找到完整的方法签名，尝试查找类名
                class_match = re.search(r'public\s+class\s+(\w+)', user_code)
                if class_match and 'main' not in user_code.lower():
                    # 用户可能提交了完整类，尝试提取方法
                    method_in_class = re.search(r'public\s+(static\s+)?([^\s]+)\s+(\w+)\s*\([^)]*\)\s*\{', user_code, re.DOTALL)
                    if method_in_class:
                        return_type = method_in_class.group(2)
                        detected_function_name = method_in_class.group(3)
                        # 提取方法体
                        start_idx = user_code.find('{')
                        end_idx = user_code.rfind('}')
                        if start_idx != -1 and end_idx != -1:
                            body = user_code[start_idx+1:end_idx].strip()
                            # 移除方法签名行
                            lines = body.split('\n')
                            lines = [line for line in lines if not re.match(r'\s*public\s+.*', line.strip())]
                            body = '\n'.join(lines)
                            wrapped += f"    public static {return_type} {detected_function_name}(int[] nums) {{\n"
                            body_lines = body.split('\n')
                            indented_body = '\n'.join('        ' + line.rstrip() for line in body_lines if line.strip())
                            wrapped += indented_body + "\n    }\n"
                            function_name = detected_function_name
                    else:
                        # 默认方法签名
                        wrapped += f"    public static int {function_name}(int[] nums) {{\n"
                        # 假设整个代码是方法体
                        body_lines = user_code.strip().split('\n')
                        # 过滤掉类定义等
                        body_lines = [line for line in body_lines if 'public class' not in line and '{' not in line.strip()]
                        indented_body = '\n'.join('        ' + line.rstrip() for line in body_lines if line.strip())
                        wrapped += indented_body + "\n    }\n"
                else:
                    # 如果没有找到类名或包含main，使用默认方法签名（假设是方法体）
                    # 尝试从代码中提取使用的变量名
                    # 常见变量名模式
                    common_names = ['a', 'b', 'c', 'x', 'y', 'z', 'n', 'm', 'num', 'nums', 'str', 's', 'arr']
                    
                    # 从代码中查找可能使用的变量名
                    code_vars = set()
                    # 查找常见的变量使用模式：变量名后面跟空格、逗号、运算符等
                    var_pattern = r'\b([a-z][a-zA-Z0-9]*)\b'
                    matches = re.findall(var_pattern, user_code)
                    for match in matches:
                        # 过滤掉关键字和常见的方法名
                        if match not in ['int', 'return', 'if', 'for', 'while', 'public', 'static', 'void', 'main', 'class', 'System', 'out', 'println']:
                            code_vars.add(match)
                    
                    # 根据输入数据数量推断参数类型和名称
                    if len(inputs) == 0:
                        params_str = ""
                    elif len(inputs) == 1:
                        # 单个参数，根据类型推断
                        if isinstance(inputs[0], list):
                            params_str = "int[] nums"
                        elif isinstance(inputs[0], str):
                            params_str = "String s"
                        elif isinstance(inputs[0], float):
                            params_str = "double num"
                        else:
                            # 尝试使用代码中的变量名，如果没有则使用默认名
                            if code_vars:
                                params_str = f"int {list(code_vars)[0]}"
                            else:
                                params_str = "int num"
                    else:
                        # 多个参数，尝试使用代码中的变量名
                        if len(code_vars) >= len(inputs):
                            # 使用代码中出现的变量名
                            var_list = list(code_vars)[:len(inputs)]
                            # 根据输入类型确定参数类型
                            param_list = []
                            for i, var_name in enumerate(var_list):
                                if i < len(inputs):
                                    if isinstance(inputs[i], list):
                                        param_list.append(f"int[] {var_name}")
                                    elif isinstance(inputs[i], str):
                                        param_list.append(f"String {var_name}")
                                    elif isinstance(inputs[i], float):
                                        param_list.append(f"double {var_name}")
                                    else:
                                        param_list.append(f"int {var_name}")
                            params_str = ", ".join(param_list)
                        else:
                            # 使用常见的参数名（a, b, c等）
                            param_list = []
                            for i in range(len(inputs)):
                                if isinstance(inputs[i], list):
                                    param_list.append(f"int[] {common_names[min(i, len(common_names)-1)]}")
                                elif isinstance(inputs[i], str):
                                    param_list.append(f"String {common_names[min(i, len(common_names)-1)]}")
                                elif isinstance(inputs[i], float):
                                    param_list.append(f"double {common_names[min(i, len(common_names)-1)]}")
                                else:
                                    param_list.append(f"int {common_names[min(i, len(common_names)-1)]}")
                            params_str = ", ".join(param_list)
                    
                    wrapped += f"    public static int {function_name}({params_str}) {{\n"
                    body_lines = user_code.strip().split('\n')
                    indented_body = '\n'.join('        ' + line.rstrip() for line in body_lines if line.strip())
                    wrapped += indented_body + "\n    }\n"
            
            wrapped += "\n"
            wrapped += "    public static void main(String[] args) {\n"
            
            # 从已生成的方法中提取参数信息
            method_match_final = re.search(rf'public\s+static\s+[^\s]+\s+{re.escape(function_name)}\s*\(([^)]*)\)', wrapped)
            if method_match_final:
                params_str_final = method_match_final.group(1).strip()
                if params_str_final:
                    # 解析参数：提取参数名和类型
                    param_parts = [p.strip() for p in params_str_final.split(',')]
                    param_vars = []
                    for param in param_parts:
                        parts = param.split()
                        if len(parts) >= 2:
                            param_type = parts[0]
                            param_name = parts[-1]
                            param_vars.append((param_type, param_name))
                else:
                    param_vars = []
            else:
                param_vars = []
            
            # 生成测试代码（自动生成的测试代码，使用老师设置的输入）
            if len(inputs) == 0 or not param_vars:
                wrapped += f"        System.out.println({function_name}());\n"
            elif len(param_vars) == 1:
                # 单个参数
                param_type, param_name = param_vars[0]
                input_val = inputs[0]
                if param_type == "int[]":
                    arr_str = ", ".join(str(x) for x in (input_val if isinstance(input_val, list) else [input_val]))
                    wrapped += f"        int[] {param_name} = {{{arr_str}}};\n"
                    wrapped += f"        System.out.println({function_name}({param_name}));\n"
                elif param_type == "String":
                    wrapped += f"        String {param_name} = \"{input_val}\";\n"
                    wrapped += f"        System.out.println({function_name}({param_name}));\n"
                else:
                    wrapped += f"        {param_type} {param_name} = {input_val};\n"
                    wrapped += f"        System.out.println({function_name}({param_name}));\n"
            else:
                # 多个参数
                call_args = []
                for i, (param_type, param_name) in enumerate(param_vars):
                    if i < len(inputs):
                        input_val = inputs[i]
                        if param_type == "int[]":
                            arr_str = ", ".join(str(x) for x in (input_val if isinstance(input_val, list) else [input_val]))
                            wrapped += f"        int[] {param_name} = {{{arr_str}}};\n"
                            call_args.append(param_name)
                        elif param_type == "String":
                            wrapped += f"        String {param_name} = \"{input_val}\";\n"
                            call_args.append(param_name)
                        else:
                            wrapped += f"        {param_type} {param_name} = {input_val};\n"
                            call_args.append(param_name)
                    else:
                        # 参数不足，使用默认值
                        if param_type == "int[]":
                            wrapped += f"        int[] {param_name} = {{}};\n"
                        elif param_type == "String":
                            wrapped += f"        String {param_name} = \"\";\n"
                        else:
                            wrapped += f"        {param_type} {param_name} = 0;\n"
                        call_args.append(param_name)
                
                args_str = ", ".join(call_args)
                wrapped += f"        System.out.println({function_name}({args_str}));\n"
            
            wrapped += "    }\n"
            wrapped += "}\n"
        
        return wrapped
    
    def wrap_user_code(
        self,
        user_code: str,
        language: str,
        function_name: str = None,
        template_code: str = None,
        input_data: str = "",
    ) -> str:
        """
        包装用户代码为完整可执行程序（LeetCode模式）
        
        Args:
            user_code: 用户提交的代码（函数体或函数定义）
            language: 编程语言
            function_name: 函数名称
            template_code: 模板代码（可选）
            input_data: 输入数据（用于生成测试代码）
        
        Returns:
            包装后的完整代码
        """
        if language.lower() == "python":
            function_name = function_name or "solve"
            return self._wrap_python_function(user_code, function_name, template_code or "", input_data)
        elif language.lower() == "java":
            function_name = function_name or "solution"
            return self._wrap_java_function(user_code, function_name, template_code or "", input_data)
        else:
            return user_code  # 不支持的语言，直接返回原代码
    
    def execute_code(
        self,
        source_code: str,
        language: str,
        stdin: str = "",
        expected_output: Optional[str] = None,
        cpu_time_limit: int = 2,
        memory_limit: int = 128000,
        solution_mode: str = "full",
        function_name: str = None,
        template_code: str = None,
    ) -> Dict:
        """
        执行代码
        
        Args:
            source_code: 源代码（函数模式时是函数代码，完整模式时是完整程序）
            language: 编程语言 (java, python)
            stdin: 标准输入
            expected_output: 期望输出（可选）
            cpu_time_limit: CPU时间限制（秒）
            memory_limit: 内存限制（KB）
            solution_mode: 代码模式 ("full" 完整程序, "function" 函数模式)
            function_name: 函数名称（函数模式必需）
            template_code: 模板代码（函数模式可选）
        
        Returns:
            执行结果字典
        """
        language_id = self.LANGUAGE_IDS.get(language.lower())
        if not language_id:
            return {
                "success": False,
                "error": f"不支持的语言: {language}",
            }
        
        # Python和Java代码都自动使用函数模式处理（无论是否设置为函数模式）
        # 系统会自动检测函数名或使用指定的函数名，将老师设置的输入作为函数参数
        final_source_code = source_code
        if language.lower() == "python":
            # Python代码总是使用函数模式
            # 1. 优先使用任务指定的函数名
            # 2. 如果没有，从代码中自动检测函数名
            # 3. 如果都没有，使用默认函数名"solve"
            detected_function_name = function_name
            if not detected_function_name:
                # 尝试从代码中自动检测函数名
                func_match = re.search(r'def\s+(\w+)\s*\(', source_code)
                if func_match:
                    detected_function_name = func_match.group(1)
                else:
                    # 如果代码中没有函数定义，假设学生写的是函数体
                    # 使用默认函数名，系统会自动包装成函数
                    detected_function_name = "solve"
            
            # 检查代码是否包含input()或sys.stdin，如果有说明是完整程序，不包装
            has_input_output = ("input(" in source_code or 
                              "sys.stdin" in source_code or 
                              ("print(" in source_code and "def " not in source_code))
            
            if has_input_output and "def " not in source_code:
                # 完整程序，直接使用（向后兼容）
                final_source_code = source_code
            else:
                # 函数模式：包装代码
                try:
                    final_source_code = self.wrap_user_code(
                        user_code=source_code,
                        language=language,
                        function_name=detected_function_name,
                        template_code=template_code,
                        input_data=stdin,  # 使用stdin作为输入数据来生成测试代码
                    )
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"代码包装失败: {str(e)}。提示：Python代码应该编写函数，不需要处理输入输出。",
                    }
        elif language.lower() == "java":
            # Java代码总是使用函数模式
            # 1. 优先使用任务指定的函数名
            # 2. 如果没有，从代码中自动检测函数名
            # 3. 如果都没有，使用默认函数名"solution"
            detected_function_name = function_name
            if not detected_function_name:
                # 尝试从代码中自动检测函数名
                method_match = re.search(r'public\s+(static\s+)?[^\s]+\s+(\w+)\s*\(', source_code)
                if method_match:
                    detected_function_name = method_match.group(2)
                else:
                    # 如果代码中没有方法定义，使用默认函数名
                    detected_function_name = "solution"
            
            # 检查代码是否包含main方法或Scanner，如果有说明是完整程序，不包装
            has_main_or_scanner = ("public static void main" in source_code or 
                                  "Scanner" in source_code or
                                  "System.in" in source_code)
            
            if has_main_or_scanner and not re.search(r'public\s+(static\s+)?[^\s]+\s+\w+\s*\([^)]*\)\s*\{', source_code):
                # 完整程序，直接使用（向后兼容）
                final_source_code = source_code
            else:
                # 函数模式：包装代码
                try:
                    final_source_code = self.wrap_user_code(
                        user_code=source_code,
                        language=language,
                        function_name=detected_function_name,
                        template_code=template_code,
                        input_data=stdin,  # 使用stdin作为输入数据来生成测试代码
                    )
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"代码包装失败: {str(e)}。提示：Java代码应该编写方法，不需要处理输入输出（不需要Scanner或main方法）。",
                    }
        elif solution_mode == "function":
            # 其他语言只在函数模式下包装
            if not function_name:
                return {
                    "success": False,
                    "error": "函数模式需要指定函数名称",
                }
            try:
                final_source_code = self.wrap_user_code(
                    user_code=source_code,
                    language=language,
                    function_name=function_name,
                    template_code=template_code,
                    input_data=stdin,  # 使用stdin作为输入数据来生成测试代码
                )
            except Exception as e:
                return {
                    "success": False,
                    "error": f"代码包装失败: {str(e)}",
                }
        
        # 准备提交数据
        # Python和Java代码总是使用函数模式，不使用stdin；直接在代码中处理输入
        use_function_mode = (language.lower() == "python") or (language.lower() == "java") or (solution_mode == "function")
        submission_data = {
            "source_code": final_source_code,
            "language_id": language_id,
            "stdin": "" if use_function_mode else stdin,  # 函数模式下不使用stdin，直接在代码中处理输入
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
                error_details = ""
                try:
                    error_data = response.json()
                    error_details = str(error_data)
                except:
                    error_details = response.text[:500]
                
                return {
                    "success": False,
                    "error": f"API请求失败: {response.status_code}",
                    "details": error_details,
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
                    error_details = ""
                    try:
                        error_data = result_response.json()
                        error_details = str(error_data)
                    except:
                        error_details = result_response.text[:500]
                    
                    return {
                        "success": False,
                        "error": f"获取结果失败: {result_response.status_code}",
                        "details": error_details,
                    }
                
                result = result_response.json()
                status_id = result.get("status", {}).get("id")
                
                # 状态ID: 1=排队中, 2=处理中, 3=已完成
                if status_id == 3:
                    # 执行完成
                    return self._parse_result(result, expected_output)
                elif status_id in [4, 5, 6, 7, 8, 9, 10, 11, 12]:
                    # 错误状态（编译错误、运行时错误等）
                    compile_output = result.get("compile_output", "")
                    stderr = result.get("stderr", "")
                    stdout = result.get("stdout", "")
                    error_description = result.get("status", {}).get("description", "执行失败")
                    
                    # 组合错误信息
                    error_msg = error_description
                    if compile_output:
                        compile_clean = compile_output.rstrip() if compile_output else ""
                        error_msg += f": {compile_clean[:500]}"  # 限制长度
                    elif stderr:
                        stderr_clean = stderr.rstrip() if stderr else ""
                        error_msg += f": {stderr_clean[:500]}"
                    
                    return {
                        "success": False,
                        "error": error_msg,
                        "status_id": status_id,
                        "stdout": stdout,
                        "stderr": stderr,
                        "compile_output": compile_output,
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
        
        # 如果编译失败，错误信息在compile_output中
        if compile_output:
            # 清理编译错误信息
            compile_output_clean = compile_output.rstrip() if compile_output else ""
            return {
                "success": False,
                "passed": False,
                "stdout": stdout,
                "stderr": stderr,
                "compile_output": compile_output_clean,
                "error": f"编译错误: {compile_output_clean[:200]}",  # 限制长度
                "time_used": time_used,
                "memory_used": memory_used,
                "expected_output": expected_output,
            }
        
        # 判断是否通过
        passed = False
        if expected_output:
            passed = stdout == expected_output
        else:
            # 如果没有期望输出，只要没有错误就算通过
            passed = not stderr
        
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

