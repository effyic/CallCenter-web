#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mock服务器 - APP打电话回调接口
实现 /bzf-business-work-ticket/wtcWorkTicketAiRelEntity/insertRecord 接口
"""

from flask import Flask, request, jsonify
from datetime import datetime
import uuid
import json

app = Flask(__name__)

# 配置
app.config['JSON_AS_ASCII'] = False  # 支持中文输出


def generate_app_reply(code="1", data=None, msg="操作成功", message_code="", trace_id=None):
    """
    生成标准的AppReply响应格式
    
    Args:
        code: 返回编码 0:请求失败 1:请求成功 2:登录失败 3:重新登录
        data: 返回数据
        msg: 返回消息
        message_code: 系统error code
        trace_id: traceId
    """
    if trace_id is None:
        trace_id = str(uuid.uuid4())
    
    return {
        "code": code,
        "data": data,
        "messageCode": message_code,
        "msg": msg,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "traceId": trace_id
    }


@app.route('/bzf-business-work-ticket/wtcWorkTicketAiRelEntity/insertRecord', methods=['POST'])
def insert_record():
    """
    APP打电话回调接口
    新增全表数据
    """
    try:
        # 验证Content-Type
        if not request.is_json:
            return jsonify(generate_app_reply(
                code="0",
                msg="请求Content-Type必须为application/json",
                message_code="INVALID_CONTENT_TYPE"
            )), 400
        
        # 验证tokenId header
        token_id = request.headers.get('tokenId')
        if not token_id:
            return jsonify(generate_app_reply(
                code="2",
                msg="缺少tokenId header",
                message_code="MISSING_TOKEN"
            )), 401
        
        # 获取请求体数据
        request_data = request.get_json()
        if not request_data:
            return jsonify(generate_app_reply(
                code="0",
                msg="请求体不能为空",
                message_code="EMPTY_REQUEST_BODY"
            )), 400
        
        # 获取vo对象
        vo = request_data.get('vo', {})
        
        # 验证WtcWorkTicketAiRelVo对象的字段（可选验证）
        uuid_field = vo.get('uuid')
        work_ticket_id = vo.get('workTicketId')
        
        # 模拟数据处理
        print(f"收到请求:")
        print(f"  tokenId: {token_id}")
        print(f"  vo.uuid: {uuid_field}")
        print(f"  vo.workTicketId: {work_ticket_id}")
        
        # 生成模拟的新增主键
        new_record_id = str(uuid.uuid4())
        
        # 返回成功响应
        return jsonify(generate_app_reply(
            code="1",
            data=new_record_id,
            msg="数据新增成功"
        )), 200
        
    except json.JSONDecodeError:
        return jsonify(generate_app_reply(
            code="0",
            msg="JSON格式错误",
            message_code="INVALID_JSON"
        )), 400
    
    except Exception as e:
        print(f"服务器内部错误: {str(e)}")
        return jsonify(generate_app_reply(
            code="0",
            msg="服务器内部错误",
            message_code="INTERNAL_ERROR"
        )), 500


@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "service": "Mock Server for APP Call Callback"
    })


@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify(generate_app_reply(
        code="0",
        msg="接口不存在",
        message_code="NOT_FOUND"
    )), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """405错误处理"""
    return jsonify(generate_app_reply(
        code="0",
        msg="请求方法不允许",
        message_code="METHOD_NOT_ALLOWED"
    )), 405


if __name__ == '__main__':
    print("启动Mock服务器...")
    print("接口地址: http://localhost:5000/bzf-business-work-ticket/wtcWorkTicketAiRelEntity/insertRecord")
    print("健康检查: http://localhost:5000/health")
    print("按 Ctrl+C 停止服务器")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )