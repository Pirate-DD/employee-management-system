# API接口设计文档 - 企业员工管理系统

## 1. 引言

### 1.1 编写目的
本文档详细描述"企业员工管理系统"的API接口设计，包括接口规范、请求响应格式、各模块API列表等，为前后端开发和系统对接提供依据。

### 1.2 适用范围
本文档适用于前端开发工程师、后端开发工程师、第三方系统对接人员。

### 1.3 接口规范概述

| 项目 | 说明 |
|------|------|
| 协议 | HTTP/HTTPS |
| 风格 | RESTful API |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | Bearer Token (JWT) |
| 版本管理 | URL路径版本（/api/v1/...） |
| 接口文档 | Swagger/OpenAPI 3.0 |

---

## 2. 通用规范

### 2.1 请求头

| 头部字段 | 是否必填 | 说明 |
|----------|----------|------|
| Content-Type | 是 | application/json |
| Authorization | 是（登录后） | Bearer {token} |
| X-Request-Id | 否 | 请求唯一标识（用于日志追踪） |
| X-Client-Type | 否 | 客户端类型（web/mobile/api） |

### 2.2 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 业务数据
  },
  "timestamp": 1724644800000,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**响应字段说明：**
| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 业务状态码 |
| message | String | 响应消息 |
| data | Object | 业务数据 |
| timestamp | Long | 响应时间戳（毫秒） |
| requestId | String | 请求ID（用于追踪） |

### 2.3 分页响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      // 数据列表
    ],
    "pagination": {
      "total": 1000,
      "page": 1,
      "pageSize": 10,
      "totalPages": 100
    }
  },
  "timestamp": 1724644800000,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2.4 状态码定义

#### HTTP状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 204 | 操作成功（无返回内容） |
| 400 | 请求参数错误 |
| 401 | 未认证/认证失败 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复创建） |
| 422 | 请求验证失败 |
| 500 | 服务器内部错误 |

#### 业务状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 201 | 创建成功 |
| 1001 | 参数校验失败 |
| 1002 | 数据已存在 |
| 1003 | 数据不存在 |
| 2001 | 用户名或密码错误 |
| 2002 | 账号已锁定 |
| 2003 | Token已过期 |
| 2004 | 无访问权限 |
| 3001 | 业务规则校验失败 |
| 5001 | 服务器内部错误 |

### 2.5 RESTful URL设计规范

| 操作 | HTTP方法 | URL模式 | 示例 |
|------|----------|---------|------|
| 查询列表 | GET | /{resource} | GET /api/v1/employees |
| 查询详情 | GET | /{resource}/{id} | GET /api/v1/employees/1 |
| 创建 | POST | /{resource} | POST /api/v1/employees |
| 更新 | PUT | /{resource}/{id} | PUT /api/v1/employees/1 |
| 部分更新 | PATCH | /{resource}/{id} | PATCH /api/v1/employees/1 |
| 删除 | DELETE | /{resource}/{id} | DELETE /api/v1/employees/1 |
| 批量操作 | POST | /{resource}/batch | POST /api/v1/employees/batch |

---

## 3. 认证模块API

### 3.1 用户登录

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/auth/login |
| Method | POST |
| 认证 | 无需认证 |
| 描述 | 用户登录获取Token |

**请求体**
```json
{
  "username": "string (必填，用户名)",
  "password": "string (必填，密码)",
  "captchaCode": "string (验证码，可选)",
  "captchaKey": "string (验证码key，可选)"
}
```

**请求字段说明**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 登录用户名 |
| password | String | 是 | 登录密码 |
| captchaCode | String | 否 | 验证码（登录失败3次后启用） |
| captchaKey | String | 否 | 验证码Key |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "string",
    "expiresIn": 86400,
    "userInfo": {
      "userId": 1,
      "username": "admin",
      "realName": "管理员",
      "avatar": "/avatars/default.png",
      "roles": ["ADMIN"],
      "permissions": ["system:user:list", "system:user:create", ...]
    }
  }
}
```

**失败响应（HTTP 401）**
```json
{
  "code": 2001,
  "message": "用户名或密码错误",
  "data": null,
  "timestamp": 1724644800000
}
```

---

### 3.2 用户登出

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/auth/logout |
| Method | POST |
| 认证 | 需要Token |
| 描述 | 用户登出，注销Token |

**请求体**
无

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

---

### 3.3 刷新Token

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/auth/refresh-token |
| Method | POST |
| 认证 | 需要RefreshToken |
| 描述 | 刷新AccessToken |

**请求体**
```json
{
  "refreshToken": "string (必填，刷新令牌)"
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "string",
    "expiresIn": 86400
  }
}
```

---

### 3.4 获取当前用户信息

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/auth/current-user |
| Method | GET |
| 认证 | 需要Token |
| 描述 | 获取当前登录用户详细信息 |

**请求参数**
无

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userId": 1,
    "username": "admin",
    "realName": "系统管理员",
    "avatar": "/avatars/admin.png",
    "email": "admin@company.com",
    "phone": "138****8888",
    "roles": [
      {
        "id": 1,
        "roleCode": "ADMIN",
        "roleName": "系统管理员"
      }
    ],
    "permissions": ["system:user:list", "system:user:create", ...],
    "employeeInfo": {
      "empNo": "EMP001",
      "deptId": 1,
      "deptName": "技术部",
      "position": "技术总监"
    }
  }
}
```

---

## 4. 员工管理模块API

### 4.1 查询员工列表

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/employees |
| Method | GET |
| 认证 | 需要Token |
| 权限 | employee:info:list |
| 描述 | 分页查询员工列表 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页条数，默认10 |
| keyword | String | 否 | 搜索关键词（姓名/工号/手机号） |
| deptId | Long | 否 | 部门ID |
| position | String | 否 | 岗位 |
| employeeStatus | Integer | 否 | 在职状态：0-离职，1-在职，2-试用期 |
| entryDateStart | String | 否 | 入职日期开始（yyyy-MM-dd） |
| entryDateEnd | String | 否 | 入职日期结束（yyyy-MM-dd） |
| sortField | String | 否 | 排序字段 |
| sortOrder | String | 否 | 排序方向：asc/desc |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "empNo": "EMP20230001",
        "name": "张三",
        "gender": 1,
        "deptId": 2,
        "deptName": "技术部-后端组",
        "position": "高级工程师",
        "level": "P6",
        "phone": "138****8888",
        "email": "zhangsan@company.com",
        "avatar": "/avatars/emp001.png",
        "entryDate": "2023-01-15",
        "employeeStatus": 1,
        "employeeStatusText": "在职"
      }
    ],
    "pagination": {
      "total": 500,
      "page": 1,
      "pageSize": 10,
      "totalPages": 50
    }
  }
}
```

---

### 4.2 查询员工详情

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/employees/{id} |
| Method | GET |
| 认证 | 需要Token |
| 权限 | employee:info:list |
| 描述 | 查询单个员工详细信息 |

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 员工ID |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "empNo": "EMP20230001",
    "userInfo": {
      "userId": 5,
      "username": "zhangsan",
      "status": 1
    },
    "basicInfo": {
      "name": "张三",
      "gender": 1,
      "genderText": "男",
      "birthDate": "1990-05-15",
      "idCard": "330***********1234",
      "phone": "138****8888",
      "email": "zhangsan@company.com",
      "avatar": "/avatars/emp001.png",
      "education": "本科",
      "politicalStatus": "党员",
      "nativePlace": "浙江杭州",
      "address": "杭州市西湖区XX路XX号",
      "emergencyContact": "张父",
      "emergencyPhone": "139****9999"
    },
    "workInfo": {
      "deptId": 2,
      "deptName": "技术部-后端组",
      "position": "高级工程师",
      "level": "P6",
      "entryDate": "2023-01-15",
      "probationEndDate": "2023-04-15",
      "contractEndDate": "2026-01-14",
      "employeeStatus": 1,
      "employeeStatusText": "在职"
    },
    "salaryInfo": {
      "baseSalary": 15000.00,
      "planName": "技术岗P6方案"
    }
  }
}
```

---

### 4.3 创建员工

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/employees |
| Method | POST |
| 认证 | 需要Token |
| 权限 | employee:info:create |
| 描述 | 创建新员工 |

**请求体**
```json
{
  "username": "string (必填，登录用户名)",
  "password": "string (必填，初始密码)",
  "empNo": "string (必填，工号)",
  "name": "string (必填，姓名)",
  "gender": "integer (必填，性别：0-女，1-男)",
  "phone": "string (手机号)",
  "email": "string (邮箱)",
  "deptId": "long (必填，部门ID)",
  "position": "string (岗位)",
  "level": "string (职级)",
  "entryDate": "string (必填，入职日期，yyyy-MM-dd)",
  "education": "string (学历)",
  "politicalStatus": "string (政治面貌)",
  "nativePlace": "string (籍贯)",
  "address": "string (住址)",
  "emergencyContact": "string (紧急联系人)",
  "emergencyPhone": "string (紧急联系电话)",
  "avatar": "string (头像URL)"
}
```

**成功响应（HTTP 201）**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 100,
    "empNo": "EMP20230100",
    "username": "lisi",
    "name": "李四"
  }
}
```

---

### 4.4 更新员工信息

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/employees/{id} |
| Method | PUT |
| 认证 | 需要Token |
| 权限 | employee:info:update |
| 描述 | 更新员工详细信息 |

**请求体**
```json
{
  "name": "string (姓名)",
  "gender": "integer (性别)",
  "phone": "string (手机号)",
  "email": "string (邮箱)",
  "deptId": "long (部门ID)",
  "position": "string (岗位)",
  "level": "string (职级)",
  "avatar": "string (头像URL)",
  "education": "string (学历)",
  "address": "string (住址)"
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 4.5 删除员工（逻辑删除）

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/employees/{id} |
| Method | DELETE |
| 认证 | 需要Token |
| 权限 | employee:info:delete |
| 描述 | 删除员工（逻辑删除） |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 4.6 员工离职登记

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/employees/{id}/resign |
| Method | POST |
| 认证 | 需要Token |
| 权限 | employee:info:update |
| 描述 | 办理员工离职手续 |

**请求体**
```json
{
  "resignationDate": "string (必填，离职日期，yyyy-MM-dd)",
  "resignationReason": "string (离职原因)"
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "离职登记成功",
  "data": null
}
```

---

### 4.7 导出员工信息

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/employees/export |
| Method | GET |
| 认证 | 需要Token |
| 权限 | employee:info:export |
| 描述 | 导出员工信息为Excel文件 |

**请求参数**
与查询员工列表接口相同。

**成功响应**
返回Excel文件流，响应头：
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment; filename="employees_20260825.xlsx"

---

## 5. 部门管理模块API

### 5.1 查询部门树

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/departments/tree |
| Method | GET |
| 认证 | 需要Token |
| 权限 | department:info:list |
| 描述 | 查询完整部门树结构 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| includeEmployeeCount | Boolean | 否 | 是否包含员工数量，默认false |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "parentId": 0,
      "deptCode": "ROOT",
      "deptName": "企业总部",
      "leader": "张总",
      "phone": "0571-88888888",
      "email": "hq@company.com",
      "sortOrder": 0,
      "status": 1,
      "employeeCount": 50,
      "children": [
        {
          "id": 2,
          "parentId": 1,
          "deptCode": "TECH",
          "deptName": "技术部",
          "leader": "李总",
          "employeeCount": 30,
          "children": [
            {
              "id": 5,
              "parentId": 2,
              "deptCode": "FRONTEND",
              "deptName": "前端组",
              "employeeCount": 10,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 5.2 创建部门

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/departments |
| Method | POST |
| 认证 | 需要Token |
| 权限 | department:info:create |
| 描述 | 创建新部门 |

**请求体**
```json
{
  "parentId": "long (父级部门ID，0为顶级)",
  "deptCode": "string (必填，部门编码)",
  "deptName": "string (必填，部门名称)",
  "leader": "string (部门负责人)",
  "phone": "string (联系电话)",
  "email": "string (邮箱)",
  "sortOrder": "integer (排序号)"
}
```

**成功响应（HTTP 201）**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 10,
    "deptCode": "OPS",
    "deptName": "运营部"
  }
}
```

---

### 5.3 更新部门

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/departments/{id} |
| Method | PUT |
| 认证 | 需要Token |
| 权限 | department:info:update |
| 描述 | 更新部门信息 |

**请求体**
```json
{
  "deptName": "string (部门名称)",
  "leader": "string (部门负责人)",
  "phone": "string (联系电话)",
  "email": "string (邮箱)",
  "sortOrder": "integer (排序号)",
  "status": "integer (状态：0-禁用，1-启用)"
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 5.4 删除部门

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/departments/{id} |
| Method | DELETE |
| 认证 | 需要Token |
| 权限 | department:info:delete |
| 描述 | 删除部门（需无下属部门和员工） |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 6. 考勤管理模块API

### 6.1 员工打卡

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/attendance/check-in |
| Method | POST |
| 认证 | 需要Token |
| 权限 | attendance:record:checkin |
| 描述 | 员工上班/下班打卡 |

**请求体**
```json
{
  "checkType": "string (必填，类型：IN-上班打卡，OUT-下班打卡)",
  "latitude": "number (纬度，可选)",
  "longitude": "number (经度，可选)",
  "remark": "string (备注)"
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "打卡成功",
  "data": {
    "id": 1,
    "attendanceDate": "2026-08-25",
    "checkInTime": "2026-08-25T08:55:00",
    "checkOutTime": null,
    "workStatus": 1,
    "workStatusText": "正常"
  }
}
```

---

### 6.2 查询考勤记录

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/attendance |
| Method | GET |
| 认证 | 需要Token |
| 权限 | attendance:record:list |
| 描述 | 查询考勤记录 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页条数 |
| empId | Long | 否 | 员工ID（管理员可查所有，员工只能查自己） |
| startDate | String | 否 | 开始日期（yyyy-MM-dd） |
| endDate | String | 否 | 结束日期（yyyy-MM-dd） |
| workStatus | Integer | 否 | 工作状态 |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "empId": 1,
        "empNo": "EMP20230001",
        "empName": "张三",
        "attendanceDate": "2026-08-25",
        "checkInTime": "2026-08-25T08:55:00",
        "checkOutTime": "2026-08-25T18:05:00",
        "workStatus": 1,
        "workStatusText": "正常",
        "workHours": 8.00,
        "isLate": 0,
        "isEarly": 0
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 6.3 月度考勤统计

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/attendance/statistics |
| Method | GET |
| 认证 | 需要Token |
| 权限 | attendance:record:list |
| 描述 | 查询月度考勤统计 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| empId | Long | 否 | 员工ID |
| month | String | 是 | 月份（yyyy-MM） |
| deptId | Long | 否 | 部门ID（管理员可用） |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "month": "2026-08",
    "totalDays": 22,
    "statistics": {
      "normalDays": 20,
      "lateDays": 1,
      "earlyDays": 0,
      "leaveDays": 1,
      "overtimeHours": 12.5,
      "absenceDays": 0
    }
  }
}
```

---

### 6.4 提交请假申请

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/attendance/leaves |
| Method | POST |
| 认证 | 需要Token |
| 权限 | attendance:leave:apply |
| 描述 | 提交请假申请 |

**请求体**
```json
{
  "leaveType": "integer (必填，请假类型)",
  "startDate": "string (必填，开始时间，yyyy-MM-dd HH:mm)",
  "endDate": "string (必填，结束时间，yyyy-MM-dd HH:mm)",
  "reason": "string (必填，请假原因)",
  "attachment": "string (证明材料URL，可选)"
}
```

**成功响应（HTTP 201）**
```json
{
  "code": 201,
  "message": "申请提交成功",
  "data": {
    "leaveNo": "LEAVE20260825001",
    "durationDays": 2.0
  }
}
```

---

### 6.5 审批请假申请

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/attendance/leaves/{id}/approve |
| Method | POST |
| 认证 | 需要Token |
| 权限 | attendance:leave:approve |
| 描述 | 审批请假申请 |

**请求体**
```json
{
  "approveStatus": "integer (必填，审批状态：1-通过，2-驳回)",
  "approveRemark": "string (审批意见)"
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "审批成功",
  "data": null
}
```

---

### 6.6 提交加班申请

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/attendance/overtimes |
| Method | POST |
| 认证 | 需要Token |
| 权限 | attendance:overtime:apply |
| 描述 | 提交加班申请 |

**请求体**
```json
{
  "overtimeDate": "string (必填，加班日期，yyyy-MM-dd)",
  "startTime": "string (必填，开始时间，HH:mm)",
  "endTime": "string (必填，结束时间，HH:mm)",
  "reason": "string (必填，加班原因)"
}
```

**成功响应（HTTP 201）**
```json
{
  "code": 201,
  "message": "申请提交成功",
  "data": {
    "overtimeNo": "OT20260825001",
    "durationHours": 3.0
  }
}
```

---

## 7. 薪资管理模块API

### 7.1 查询薪资方案列表

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/salary/plans |
| Method | GET |
| 认证 | 需要Token |
| 权限 | salary:plan:list |
| 描述 | 查询薪资方案列表 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页条数 |
| keyword | String | 否 | 关键词搜索 |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "planCode": "TECH_P6",
        "planName": "技术岗P6方案",
        "position": "高级工程师",
        "baseSalary": 15000.00,
        "performanceSalary": 5000.00,
        "postAllowance": 2000.00,
        "mealAllowance": 500.00,
        "total": 22500.00,
        "status": 1
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 7.2 查询员工薪资条

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/salary/records |
| Method | GET |
| 认证 | 需要Token |
| 权限 | salary:record:list |
| 描述 | 查询员工薪资记录 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页条数 |
| empId | Long | 否 | 员工ID |
| salaryMonth | String | 否 | 薪资月份（yyyy-MM） |
| approveStatus | Integer | 否 | 审批状态 |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "salaryNo": "SAL202608001",
        "empId": 1,
        "empName": "张三",
        "salaryMonth": "2026-08",
        "baseSalary": 15000.00,
        "performanceSalary": 5000.00,
        "postAllowance": 2000.00,
        "mealAllowance": 500.00,
        "overtimePay": 500.00,
        "leaveDeduction": 0,
        "grossSalary": 23000.00,
        "pensionDeduction": 1200.00,
        "medicalDeduction": 300.00,
        "unemploymentDeduction": 60.00,
        "housingFundDeduction": 1500.00,
        "taxDeduction": 1500.00,
        "totalDeduction": 4560.00,
        "netSalary": 18440.00,
        "approveStatus": 1,
        "payStatus": 1
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 7.3 生成月度薪资

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/salary/records/generate |
| Method | POST |
| 认证 | 需要Token |
| 权限 | salary:record:generate |
| 描述 | 自动生成月度薪资记录 |

**请求体**
```json
{
  "salaryMonth": "string (必填，薪资月份，yyyy-MM)",
  "deptIds": "array (部门ID列表，可选，空表示全部)",
  "description": "string (说明)"
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "生成成功",
  "data": {
    "generatedCount": 50,
    "salaryMonth": "2026-08"
  }
}
```

---

### 7.4 审批薪资

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/salary/records/{id}/approve |
| Method | POST |
| 认证 | 需要Token |
| 权限 | salary:record:approve |
| 描述 | 审批薪资记录 |

**请求体**
```json
{
  "approveStatus": "integer (必填，审批状态：1-通过，2-驳回)",
  "approveRemark": "string (审批意见)"
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "审批成功",
  "data": null
}
```

---

## 8. 绩效管理模块API

### 8.1 查询绩效评审列表

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/performance/reviews |
| Method | GET |
| 认证 | 需要Token |
| 权限 | performance:review:list |
| 描述 | 查询绩效评审列表 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页条数 |
| empId | Long | 否 | 员工ID |
| reviewPeriod | String | 否 | 评审周期 |
| reviewType | Integer | 否 | 评审类型 |
| status | Integer | 否 | 状态 |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "reviewNo": "PERF2026Q3001",
        "empId": 1,
        "empName": "张三",
        "reviewerId": 10,
        "reviewerName": "李经理",
        "reviewPeriod": "2026-Q3",
        "reviewType": 2,
        "reviewTypeText": "季度评审",
        "workScore": 88.00,
        "abilityScore": 85.00,
        "attitudeScore": 92.00,
        "totalScore": 88.33,
        "reviewLevel": "A",
        "status": 1
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 8.2 创建绩效评审

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/performance/reviews |
| Method | POST |
| 认证 | 需要Token |
| 权限 | performance:review:create |
| 描述 | 创建绩效评审 |

**请求体**
```json
{
  "empId": "long (必填，被评审员工ID)",
  "reviewPeriod": "string (必填，评审周期)",
  "reviewType": "integer (必填，评审类型)",
  "goals": [
    {
      "goalContent": "string (目标内容)",
      "weight": "number (权重%)",
      "targetValue": "string (目标值)"
    }
  ]
}
```

**成功响应（HTTP 201）**
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 100,
    "reviewNo": "PERF2026Q3001"
  }
}
```

---

### 8.3 提交绩效评分

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/performance/reviews/{id}/submit |
| Method | POST |
| 认证 | 需要Token |
| 权限 | performance:review:submit |
| 描述 | 提交绩效评分 |

**请求体**
```json
{
  "workScore": "number (必填，工作业绩评分)",
  "abilityScore": "number (必填，能力素质评分)",
  "attitudeScore": "number (必填，工作态度评分)",
  "reviewContent": "string (评审内容)",
  "suggestion": "string (改进建议)",
  "goalScores": [
    {
      "goalId": "long (目标ID)",
      "actualValue": "string (实际值)",
      "score": "number (完成评分)"
    }
  ]
}
```

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "totalScore": 88.33,
    "reviewLevel": "A"
  }
}
```

---

## 9. 系统管理模块API

### 9.1 用户管理

#### 查询用户列表
| 项目 | 说明 |
|------|------|
| URL | /api/v1/system/users |
| Method | GET |
| 认证 | 需要Token |
| 权限 | system:user:list |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页条数 |
| keyword | String | 否 | 搜索关键词 |
| status | Integer | 否 | 状态 |
| roleId | Long | 否 | 角色ID |

**成功响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "realName": "系统管理员",
        "email": "admin@company.com",
        "phone": "138****8888",
        "status": 1,
        "lastLoginTime": "2026-08-25T10:00:00",
        "roles": ["ADMIN"]
      }
    ],
    "pagination": { ... }
  }
}
```

#### 创建用户
| 项目 | 说明 |
|------|------|
| URL | /api/v1/system/users |
| Method | POST |
| 认证 | 需要Token |
| 权限 | system:user:create |

**请求体**
```json
{
  "username": "string (必填，用户名)",
  "password": "string (必填，密码)",
  "realName": "string (真实姓名)",
  "email": "string (邮箱)",
  "phone": "string (手机号)",
  "roleIds": "array (角色ID列表)"
}
```

#### 重置密码
| 项目 | 说明 |
|------|------|
| URL | /api/v1/system/users/{id}/reset-password |
| Method | POST |
| 认证 | 需要Token |
| 权限 | system:user:update |

**请求体**
```json
{
  "newPassword": "string (必填，新密码)"
}
```

---

### 9.2 角色管理

#### 查询角色列表
| 项目 | 说明 |
|------|------|
| URL | /api/v1/system/roles |
| Method | GET |
| 认证 | 需要Token |
| 权限 | system:role:list |

**成功响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "roleCode": "ADMIN",
      "roleName": "系统管理员",
      "description": "拥有所有系统权限",
      "userCount": 1,
      "permissionCount": 50
    }
  ]
}
```

#### 创建角色
| 项目 | 说明 |
|------|------|
| URL | /api/v1/system/roles |
| Method | POST |
| 认证 | 需要Token |
| 权限 | system:role:create |

**请求体**
```json
{
  "roleCode": "string (必填，角色编码)",
  "roleName": "string (必填，角色名称)",
  "description": "string (描述)",
  "permissionIds": "array (权限ID列表)"
}
```

#### 分配权限
| 项目 | 说明 |
|------|------|
| URL | /api/v1/system/roles/{id}/permissions |
| Method | PUT |
| 认证 | 需要Token |
| 权限 | system:role:update |

**请求体**
```json
{
  "permissionIds": "array (必填，权限ID列表)"
}
```

---

### 9.3 操作日志查询

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/system/operate-logs |
| Method | GET |
| 认证 | 需要Token |
| 权限 | system:log:list |
| 描述 | 查询系统操作日志 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页条数 |
| userId | Long | 否 | 操作人ID |
| module | String | 否 | 模块 |
| action | String | 否 | 操作动作 |
| status | Integer | 否 | 状态：0-失败，1-成功 |
| startTime | String | 否 | 开始时间 |
| endTime | String | 否 | 结束时间 |

**成功响应**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 1,
        "userName": "admin",
        "module": "用户管理",
        "action": "创建用户",
        "description": "创建用户：zhangsan",
        "requestUrl": "/api/v1/system/users",
        "ip": "192.168.1.100",
        "duration": 150,
        "status": 1,
        "createTime": "2026-08-25T10:00:00"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 10. 统计分析模块API

### 10.1 员工数据看板

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/statistics/dashboard/employee |
| Method | GET |
| 认证 | 需要Token |
| 权限 | statistics:dashboard:view |
| 描述 | 获取员工数据统计 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| deptId | Long | 否 | 部门ID |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "summary": {
      "totalEmployees": 500,
      "activeEmployees": 480,
      "trialEmployees": 15,
      "resignedEmployees": 5,
      "newEmployeesThisMonth": 10
    },
    "deptDistribution": [
      { "deptId": 2, "deptName": "技术部", "count": 200, "percentage": 40 },
      { "deptId": 3, "deptName": "人力资源部", "count": 20, "percentage": 4 },
      { "deptId": 4, "deptName": "财务部", "count": 15, "percentage": 3 }
    ],
    "ageDistribution": [
      { "range": "20-25", "count": 50 },
      { "range": "26-30", "count": 150 },
      { "range": "31-35", "count": 180 },
      { "range": "36-40", "count": 80 },
      { "range": "41+", "count": 40 }
    ],
    "genderDistribution": {
      "male": 300,
      "female": 200
    }
  }
}
```

---

### 10.2 考勤数据看板

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/statistics/dashboard/attendance |
| Method | GET |
| 认证 | 需要Token |
| 权限 | statistics:dashboard:view |
| 描述 | 获取考勤数据统计 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| month | String | 是 | 月份（yyyy-MM） |
| deptId | Long | 否 | 部门ID |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "summary": {
      "averageAttendanceRate": 98.5,
      "averageLateRate": 2.0,
      "averageLeaveDays": 1.5,
      "totalOvertimeHours": 1250
    },
    "trend": [
      { "date": "2026-08-01", "attendanceRate": 99, "lateCount": 5 },
      { "date": "2026-08-02", "attendanceRate": 98, "lateCount": 8 }
    ],
    "deptRanking": [
      { "deptName": "技术部", "attendanceRate": 99.2, "lateRate": 1.5 },
      { "deptName": "财务部", "attendanceRate": 99.0, "lateRate": 1.8 }
    ]
  }
}
```

---

### 10.3 薪资数据看板

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/statistics/dashboard/salary |
| Method | GET |
| 认证 | 需要Token |
| 权限 | statistics:dashboard:view |
| 描述 | 获取薪资数据统计 |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| month | String | 是 | 薪资月份（yyyy-MM） |
| deptId | Long | 否 | 部门ID |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "summary": {
      "totalSalary": 8500000.00,
      "averageSalary": 17000.00,
      "maxSalary": 50000.00,
      "minSalary": 8000.00,
      "totalDeduction": 1200000.00
    },
    "distribution": [
      { "range": "8K-10K", "count": 50, "percentage": 10 },
      { "range": "10K-15K", "count": 150, "percentage": 30 },
      { "range": "15K-20K", "count": 180, "percentage": 36 },
      { "range": "20K-30K", "count": 80, "percentage": 16 },
      { "range": "30K+", "count": 40, "percentage": 8 }
    ],
    "deptComparison": [
      { "deptName": "技术部", "totalSalary": 4000000, "averageSalary": 20000 },
      { "deptName": "财务部", "totalSalary": 300000, "averageSalary": 15000 }
    ]
  }
}
```

---

## 11. 文件上传模块API

### 11.1 上传文件

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/files/upload |
| Method | POST |
| Content-Type | multipart/form-data |
| 认证 | 需要Token |
| 描述 | 上传文件（头像、文档等） |

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 上传的文件 |
| bucket | String | 否 | 存储桶名称，默认"default" |
| description | String | 否 | 文件描述 |

**成功响应（HTTP 201）**
```json
{
  "code": 201,
  "message": "上传成功",
  "data": {
    "fileId": "string (文件ID)",
    "fileName": "avatar_20260825.png",
    "fileType": "image/png",
    "fileSize": 102400,
    "url": "https://minio.company.com/bucket/avatar_20260825.png",
    "uploadTime": "2026-08-25T10:00:00"
  }
}
```

### 11.2 删除文件

**接口信息**
| 项目 | 说明 |
|------|------|
| URL | /api/v1/files/{fileId} |
| Method | DELETE |
| 认证 | 需要Token |
| 描述 | 删除指定文件 |

**成功响应（HTTP 200）**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 12. 接口安全规范

### 12.1 认证与授权
- 所有受保护的API必须在请求头中携带有效的JWT Token
- Token有效期为24小时，过期后需刷新
- 权限基于RBAC模型，每个API配置所需的权限标识

### 12.2 输入校验
- 所有输入参数必须进行类型和格式校验
- 字符串长度限制：用户名≤50，密码≤100，姓名≤50
- 日期格式：yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss
- 手机号：11位数字，以1开头
- 邮箱：符合标准邮箱格式

### 12.3 频率限制
- 登录接口：同一IP每分钟最多5次
- 其他接口：同一用户每秒最多30次
- 文件上传：单个用户每天最多100次

### 12.4 数据脱敏
- 身份证号：中间10位用*替代
- 手机号：中间4位用*替代
- 银行卡号：中间用*替代
- 薪资数据：普通员工只能查看本人薪资

---

## 附录

### 附录A：API模块清单

| 模块 | 路由前缀 | 接口数量 | 说明 |
|------|----------|----------|------|
| 认证 | /api/v1/auth | 4 | 登录、登出、刷新、用户信息 |
| 员工 | /api/v1/employees | 7 | CRUD、离职、导入、导出 |
| 部门 | /api/v1/departments | 5 | 树查询、CRUD |
| 考勤 | /api/v1/attendance | 8 | 打卡、查询、请假、加班 |
| 薪资 | /api/v1/salary | 6 | 方案、记录、生成、审批 |
| 绩效 | /api/v1/performance | 5 | 评审CRUD、提交评分 |
| 系统 | /api/v1/system | 10 | 用户、角色、权限、日志 |
| 统计 | /api/v1/statistics | 3 | 员工、考勤、薪资看板 |
| 文件 | /api/v1/files | 3 | 上传、下载、删除 |
| **合计** | - | **51** | - |

### 附录B：权限标识规范

| 格式 | 说明 | 示例 |
|------|------|------|
| {模块}:{功能} | 基础权限 | employee:list |
| {模块}:{功能}:{操作} | 操作级权限 | employee:list:create |
| {模块}:{功能}:import | 导入权限 | employee:import |
| {模块}:{功能}:export | 导出权限 | employee:export |

---

**文档版本历史：**

| 版本 | 日期 | 修改人 | 修改内容 |
|------|------|--------|----------|
| V1.0 | 2026-08-25 | 张三（单人） | 初始版本，创建API接口设计文档 |
