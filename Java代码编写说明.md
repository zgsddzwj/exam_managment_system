# Java代码编写说明

## 对于"计算两数之和"这样的任务

### 方式一：完整方法定义（推荐）

```java
public static int solution(int a, int b) {
    return a + b;
}
```

### 方式二：只写方法体

```java
return a + b;
```

**注意**：如果只写方法体，系统会自动检测你代码中使用的变量名（如`a, b`），并自动生成匹配的方法签名。

### 方式三：方法体带变量

```java
int result = a + b;
return result;
```

## 系统会自动做什么？

1. ✅ 自动生成完整的`Solution`类
2. ✅ 自动生成`main`方法
3. ✅ 自动将老师设置的测试用例输入作为方法参数传入
4. ✅ 自动调用你的方法并输出结果
5. ✅ 自动与期望输出进行比较

## 你不需要做什么？

❌ 不需要写`public class Solution { }`  
❌ 不需要写`public static void main(String[] args)`  
❌ 不需要使用`Scanner`读取输入  
❌ 不需要手动打印输出  

## 示例

假设任务要求：计算两数之和，输入：`5 10`，期望输出：`15`

**你只需要写：**
```java
public static int solution(int a, int b) {
    return a + b;
}
```

**系统会自动包装成：**
```java
import java.util.*;
import java.util.Arrays;

public class Solution {
    public static int solution(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int a = 5;
        int b = 10;
        System.out.println(solution(a, b));  // 输出：15
    }
}
```

