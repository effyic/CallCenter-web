# Callcenter接口规范

-----

### **目录**

1.  总体说明
2.  通话记录查询接口
3.  任务列表查询接口
4.  AI外呼创建

-----

## 1.总体说明

#### 一般接口返回数据结构：

```json
{"msg":"操作成功"， "code":0, "data":0}
```

  - `data` 为返回的具体数据
  - `code` 为接口返回的编码，0代表成功，500代表失败，405代表参数错误
  - `msg` 为响应结果说明，如果code为非零，则为请求失败的原因

#### 分页查询接口返回数据结构如下

```json
{"msg":"操作成功"， "code":0, "total":0, "rows":[] }
```

  - `code` 和 `msg` 同上
  - `rows` 为返回的当前页数据
  - `total` 为数据总量

#### code对应码表如下

| code | 说明                               |
| :--- | :--------------------------------- |
| 0    | 请求成功                           |
| 405  | 参数不合法，比如日期格式不正确等等 |
| 500  | 系统异常                           |

-----

## 2. 通话记录查询接口

  * **接口说明**：根据查询条件查询通话记录，支持查询呼入、AI外呼、人工外呼的通话记录，不支持三种类型混合查询
  * **接口地址**：`http://127.7.0.1:8899/api/aicall/records/list`
  * **请求方式**：`POST`

#### 请求参数：

| 参数名             | 参数说明   | 类型    | 是否必填 | 备注                                     |
| :----------------- | :--------- | :------ | :------- | :--------------------------------------- |
| `uuid`             | 唯一ID     | String  | N        |                                          |
| `pageNum`          | 页号       | Integer | N        |                                          |
| `pageSize`         | 每页数量   | Integer | N        |                                          |
| `callType`         | 类型       | String  | Y        | 类型（01:呼入， 02:AI 外呼，03:人工外呼) |
| `telephone`        | 号码       | String  | N        |                                          |
| `calloutTimeStart` | 时间起     | String  | N        | 格式： yyyy-MM-dd HH:mm:ss               |
| `calloutTimeEnd`   | 时间止     | String  | N        | 格式： yyyy-MM-dd HH:mm:ss               |
| `timeLenStart`     | 通话时长起 | Integer | N        | 单位秒                                   |
| `timeLenEnd`       | 通话时长止 | Integer | N        | 单位秒                                   |
| `extnum`           | 分机号     | String  | N        |                                          |

#### 响应参数：

| 参数名         | 参数说明                      | 类型    | 是否必填 | 备注                                     |
| :------------- | :---------------------------- | :------ | :------- | :--------------------------------------- |
| `uuid`         | 通话唯一标识                  | String  | Y        |                                          |
| `telephone`    | 主叫号码                      | String  | Y        |                                          |
| `callType`     | 类型                          | String  | Y        | 类型（01:呼入， 02:AI 外呼，03:人工外呼) |
| `calloutTime`  | 外呼/呼入时间                 | String  | Y        | 格式： yyyy-MM-dd HH:mm:ss               |
| `answeredTime` | 接通时间                      | String  | N        | 格式： yyyy-MM-dd HH:mm:ss               |
| `callEndTime`  | 挂机时间                      | String  | Y        | 格式： yyyy-MM-dd HH:mm:ss               |
| `hangupCause`  | 挂机原因                      | String  | Y        |                                          |
| `wavFileUrl`   | 录音文件url（播放或下载使用） | String  | N        |                                          |
| `dialogue`     | 对话内容                      | String  | N        | `{"role":"user", "content":"xxx"}`       |
| `extnum`       | 被叫号码                      | String  | N        |                                          |
| `timeLen`      | 通话时长（秒）                | Integer | Y        |                                          |

#### 请求示例：

```bash
curl -X POST http://127.0.0.1:8899/api/aicall/records/list \
-H "Content-Type: application/json" \
-d '{"callType":"02", "pageSize":5, "pageNum":1, "calloutTimeStart":"2025-08-16 00:00:00", "calloutTimeEnd":"2025-08-16 23:59:59", "timeLenStart":5}'
```

#### 响应示例：

```json
{
    "total": 4,
    "rows": [
        {
            "uuid": "2508162111590110001",
            "telephone": "18188888888",
            "calloutTime": "2025-08-16 21:11:59",
            "answeredTime": "2025-08-16 21:11:59",
            "callEndTime": "2025-08-16 21:12:04",
            "hangupCause": "NORMAL_CLEARING:sip:200",
            "wavFileUrl": "http://127.0.0.1:8899/recordings/files?filename=ai_call/2025/08/16/21/2508162111590110001.wav",
            "dialogue": [
                {
                    "role": "assistant",
                    "content": "您好，欢迎致电未来科技大学，请问有什么可以帮到您？"
                }
            ],
            "extnum": null,
            "timeLen": 5
        },
        {
            "uuid": "2508162111300110001",
            "telephone": "18188888889",
            "calloutTime": "2025-08-16 21:11:30",
            "answeredTime": "2025-08-16 21:11:31",
            "callEndTime": "2025-08-16 21:11:54",
            "hangupCause": "NORMAL_CLEARING:sip:200",
            "wavFileUrl": "http://127.0.0.1:8899/recordings/files?filename=ai_call/2025/08/16/21/2508162111300110001.wav",
            "dialogue": [
                {
                    "role": "assistant",
                    "content": "您好，欢迎致电未来科技大学，请问有什么可以帮到您？"
                },
                {
                    "role": "user",
                    "content": "呃，学校地址是在哪里？"
                },
                {
                    "role": "assistant",
                    "content": "xxxxx"
                }
            ],
            "extnum": null,
            "timeLen": 24
        },
        {
            "uuid": "2508162057160110001",
            "telephone": "18188888888",
            "calloutTime": "2025-08-16 20:57:16",
            "answeredTime": "",
            "callEndTime": "2025-08-16 20:57:16",
            "hangupCause": "NORMAL_TEMPORARY_FAILURE:sip:503",
            "wavFileUrl": "",
            "dialogue": [],
            "extnum": null,
            "timeLen": 0
        },
        {
            "uuid": "2508162057010110001",
            "telephone": "18188888889",
            "calloutTime": "2025-08-16 20:57:01",
            "answeredTime": "",
            "callEndTime": "2025-08-16 20:57:01",
            "hangupCause": "NORMAL_TEMPORARY_FAILURE:sip:503",
            "wavFileUrl": "",
            "dialogue": [],
            "extnum": null,
            "timeLen": 0
        }
    ],
    "code": 0,
    "msg": null
}
```



## 3.任务列表查询接口



- **接口说明**：获取任务列表，以及各任务拨打统计数据
- **接口地址**：`http://127.0.1.8899/api/aicall/calltask/list`
- **请求方式**：`POST`



#### 请求参数：



| 参数名            | 参数说明       | 类型    | 是否必填 | 备注                       |
| ----------------- | -------------- | ------- | -------- | -------------------------- |
| `pageNum`         | 页号           | Integer | Y        |                            |
| `pageSize`        | 每页数量       | Integer | Y        |                            |
| `batchId`         | 任务 id        | Long    | N        |                            |
| `createTimeStart` | 任务创建时间起 | String  | N        | 格式： yyyy-MM-dd HH:mm:ss |
| `createTimeEnd`   | 任务创建时间止 | String  | N        | 格式： yyyy-MM-dd HH:mm:ss |



#### 响应参数：



| 参数名          | 参数说明 | 类型    | 是否必填 | 备注 |
| --------------- | -------- | ------- | -------- | ---- |
| `batchId`       | 任务 id  | Long    | Y        |      |
| `taskType`      | 任务类型 | Integer | Y        |      |
| `createtime`    | 创建时间 | Long    | Y        |      |
| `stopTime`      | 结束时间 | Long    | N        |      |
| `connected`     | 是否接通 | Boolean | N        |      |
| `ticketNo`      | 工单编号 | string    | Y        |      |
| `phone`         | 手机号码 | string  | Y        |      |
| `username`      | 用户姓名 | string  | Y        |      |
| `ticketType`    | 工单类型 | string  | Y        |      |
| `ticketContent` | 工单内容 | string  | Y        |      |
| `status`        | 任务状态 | string  | Y        |      |



#### 请求示例：



Bash

```
curl -X POST 'http://127.0.1.8899/api/aicall/calltask/list' \
-H 'Content-Type: application/json' \
-d '{
  "pageNum": 1,
  "pageSize": 10,
  "batchId": 10012,
  "batchName": "九月份营销活动",
  "createTimeStart": "2023-09-01 00:00:00",
  "createTimeEnd": "2023-09-30 23:59:59"
}'
```



#### 响应示例：



JSON

```
{
    "code": 200,
    "msg": "查询成功",
    "total": 1,
    "rows": [
        {
        "batchId": 10012,
        "taskType": 1,
        "createtime": 1693526400000,
        "stopTime": 1696031999000,
        "connected": true,
        "ticketNo": "T20230901001",
        "phone": "13800138000",
        "username": "张三",
        "ticketType": "新用户回访",
        "ticketContent": "关于新用户首次体验的回访电话。",
        "status": "已完成"
        }
    ]
}
```

------



## 4.AI外呼创建

- **接口说明**：AI外呼任务创建
- **接口地址**：`http://127.0.0.1:8899/api/aicall/createTasks`
- **请求方式**：`POST`
- **请求参数**：无

#### 请求参数：

| 参数名          | 参数说明 | 类型   | 是否必填 | 备注 |
| --------------- | -------- | ------ | -------- | ---- |
| `ticketNo`      | 工单编号 | string   | Y        |      |
| `phone`         | 号码     | string | Y        |      |
| `username`      | 用户姓名 | string | Y        |      |
| `ticketType`    | 工单类型 | string | Y        |      |
| `ticketContent` | 工单内容 | string | Y        |      |

#### 请求示例：

Bash

```
curl -X POST 'http://127.0.0.1:8899/api/aicall/createTasks' \
-H 'Content-Type: application/json' \
-d '[
    {
        "ticketNo": "T20231001001",
        "phone": "13912345678",
        "username": "张三",
        "ticketType": "活动通知1",
        "ticketContent": "尊敬的张三先生，提醒您参加我们本周末的线下优惠活动。"
    },
    {
        "ticketNo": "T20231001002",
        "phone": "13912345698",
        "username": "李四",
        "ticketType": "活动通知2",
        "ticketContent": "尊敬的李四先生，提醒您参加我们本周末的线下优惠活动。"
    }
]'
```

#### 响应示例：

JSON

```
{
    "code": 200,
    "msg": "任务创建成功",
    "data": [
        {
            "batchId": 10013,
            "ticketNo": "T20231001001"
        },
        {
            "batchId": 10014,
            "ticketNo": "T20231001002"
        }
    ]
}
```



## 5.批量停止外呼任务

POST /aicall/stopTasks

> Body 请求参数

```json
{
  "batchIds": [
    0
  ]
}
```

### 请求参数

|名称|位置|类型|必选| 说明       |
|---|---|---|---|----------|
|body|body|object| 否 | none     |
|» batchIds|body|[integer]| 是 | 外呼任务ID集合 |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": null,
  "msg": "string"
}
```

### 返回结果

|状态码|状态码含义| 说明   |数据模型|
|---|---|------|---|
|200|OK| none |Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选| 约束   |中文名|说明|
|---|---|---|------|---|---|
|» code|integer|true| 状态码  ||0: 请求成功|
|» data|null|true| none ||none|
|» msg|string|true| none ||none|


------

