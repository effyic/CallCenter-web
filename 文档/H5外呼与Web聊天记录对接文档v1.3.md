------

# H5外呼与聊天记录对接文档

本文档用于说明如何跳转至 H5 外呼页面及聊天记录页面，实现与呼叫中心系统的集成。

------

## 一、H5 外呼跳转页面

- **页面地址：**

  ```
  https://outbound.skiffchat.com/phone-bar-ex.html
  ```

- **请求方式：**
   GET（URL 直接跳转）

- **完整示例：**

  ```
  https://outbound.skiffchat.com/phone-bar-ex.html?uid=1008&phone=013573789321&tokenId=test-token-id&workTicketId=12321312&userId=1222
  ```

- **参数说明：**

| 参数名       | 类型   | 必填 | 说明               |
| ------------ | ------ | ---- | ------------------ |
| uid          | String | 是   | 登录唯一标识       |
| userId       | String | 是   | 用户ID             |
| phone        | String | 是   | 需要外呼的电话号码 |
| tokenId      | String | 是   | 登录凭证           |
| workTicketId | String | 否   | 工单或任务 ID      |

- **功能说明：**
   外呼客户时，可直接通过拼接上述参数跳转到外呼页面，页面将自动发起呼叫操作。

------

## 二、聊天记录跳转页面

- **页面地址：**

  ```
  http://172.16.1.17:8902/phone-record.html
  ```

- **请求方式：**
   GET（URL 直接跳转）

- **完整示例：**

  ```
  http://172.16.1.17:8902/phone-record.html?uuid=22bdf586-c39f-4e6f-a3d1-e4fa1050faf9
  ```

- **参数说明：**

| 参数名 | 类型   | 必填 | 说明                   |
| ------ | ------ | ---- | ---------------------- |
| uuid   | String | 是   | 通话或聊天记录唯一标识 |

- **功能说明：**
   第三方系统可通过传入 `uuid`，跳转至对应通话或聊天记录详情页面



