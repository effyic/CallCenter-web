// 创建HTML结构
function createRecordHTML() {
    const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>通话记录查询</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                color: #333;
            }
            .query-section {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 6px;
                margin-bottom: 20px;
            }
            .query-info {
                display: flex;
                gap: 20px;
                margin-bottom: 15px;
            }
            .info-item {
                flex: 1;
            }
            .info-item label {
                font-weight: bold;
                color: #555;
            }
            .info-item span {
                color: #007bff;
            }
            .btn {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .btn:hover {
                background-color: #0056b3;
            }
            .btn:disabled {
                background-color: #6c757d;
                cursor: not-allowed;
            }
            .loading {
                text-align: center;
                padding: 20px;
                color: #666;
            }
            .error {
                background-color: #f8d7da;
                color: #721c24;
                padding: 15px;
                border-radius: 4px;
                margin: 10px 0;
            }
            .records-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .records-table th,
            .records-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            .records-table th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .records-table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .records-table tr:hover {
                background-color: #f5f5f5;
            }
            .no-data {
                text-align: center;
                padding: 40px;
                color: #666;
                font-style: italic;
            }
            /* AI对话样式 */ 
            .dialogue-container {
                border-radius: 12px;
                padding: 20px;
                max-height: 500px;
                overflow-y: auto;
            }
            .message {
                display: flex;
                align-items: flex-start;
            }
            .message.user {
                justify-content: flex-end;
            }
            .message.assistant {
                justify-content: flex-start;
            }
            .message-content {
                padding: 12px 16px;
                border-radius: 18px;
                word-wrap: break-word;
                line-height: 1.4;
                position: relative;
                background:linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%);
            }
            .message.user .message-content {
                max-width: 500px;
                color: white;
                background: linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%) !important;
                word-break: break-word;
                line-height: 1.6;
                color: #263238;
                font-size: 14px;
                 padding:10px 14px;
                box-sizing:border-box;
                margin-bottom:12px;
            }
            .message.assistant .message-content {
                max-width: 70%;
                padding:10px 14px;
                box-sizing:border-box;
                color: #333;
                border: 1px solid #e0e0e0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                background: linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%) !important;
                word-break: break-word;
                line-height: 1.6;
                color: #263238;
                font-size: 14px;
                 margin-bottom:12px;
            }
            .message-role {
                font-size: 12px;
                color: #666;
                margin: 0 10px 5px;
                font-weight: bold;
            }
            .message.user .message-role {
                text-align: right;
            }
            .message.assistant .message-role {
                text-align: left;
            }
            .no-dialogue {
                text-align: center;
                padding: 30px;
                color: #666;
                font-style: italic;
                background: rgba(255,255,255,0.7);
                border-radius: 8px;
            }
            /* 音频播放器样式 */
            .audio-player {
                width: 100%;
                max-width: 300px;
                height: 40px;
                outline: none;
            }
            .audio-player::-webkit-media-controls-panel {
                background-color: #f8f9fa;
                border-radius: 4px;
            }
            .audio-cell {
                text-align: center;
                padding: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div id="message"></div>
            
            <div id="results">
                <div id="recordsContainer"></div>
                
                <!-- AI对话展示容器 -->
                <div id="dialogueContainer" style="display: none;">
                    <div class="dialogue-container">
                        <div id="dialogueContent"></div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    return html;
}

// 从地址栏获取UUID参数
function getUuidFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uuid') || '2509100208520110001'; // 默认值作为后备
}

// 查询通话记录的函数
async function queryRecords() {
    const message = document.getElementById('message');
    const results = document.getElementById('results');
    const recordsContainer = document.getElementById('recordsContainer');
    
    // 获取UUID
    const uuid = getUuidFromUrl();
    
    try {
        // 调用接口
        const response = await fetch(`http://172.16.1.17:8902/aicall/api/records/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                uuid: uuid,
                callType: '01'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const data = await response.json();
        const record = data.rows[0]?.dialogue;
        console.log(record,'接口返回数据');

        
        // 显示结果
        displayRecords(data, recordsContainer);
        
        // 显示AI对话记录
        const dialogueContent = document.getElementById('dialogueContent');
        if (record && dialogueContent) {
            // 如果record是字符串，尝试解析为JSON
            let dialogueData = record;
            if (typeof record === 'string') {
                try {
                    dialogueData = JSON.parse(record);
                } catch (e) {
                    console.warn('对话数据解析失败:', e);
                    dialogueData = null;
                }
            }
            displayDialogue(dialogueData, dialogueContent);
        }
        
    } catch (error) {
        console.error('查询失败:', error);
        message.innerHTML = `<div class="error">查询失败: ${error.message}</div>`;
    }
}

// 显示通话记录的函数
function displayRecords(data, container) {
    console.log(data,'通话记录函数')
    const ip = 'http://172.16.1.17:8902';
    const records = data.rows;
    
    let audioHTML = '';
    
    records.forEach((record, index) => {
        if (record.wavFileUrl) {
            audioHTML += `
                <div style="margin: 10px 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <audio controls src="${ip+record.wavFileUrl}" style="width: 100%;"></audio>
                </div>
            `;
        }
    });
    
    if (!audioHTML) {
        audioHTML = '<div style="text-align: center; color: #666; padding: 20px;">暂无音频文件</div>';
    }
    
    container.innerHTML = audioHTML;
}

// 显示AI对话记录
function displayDialogue(dialogueData, container) {
    if (!dialogueData || !Array.isArray(dialogueData) || dialogueData.length === 0) {
        container.innerHTML = '<div class="no-dialogue">暂无AI对话记录</div>';
        return;
    }
    
    let dialogueHTML = '';
    
    dialogueData.forEach((message, index) => {
        if (message.role && message.content) {
            const roleClass = message.role === 'user' ? 'user' : 'assistant';
            const roleText = message.role === 'user' ? '用户' : 'AI助手';
            
            dialogueHTML += `
                <div class="message ${roleClass}">
                    <div>
                        <div class="message-content">${message.content}</div>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = dialogueHTML;
    
    // 显示对话容器
    const dialogueContainer = document.getElementById('dialogueContainer');
    if (dialogueContainer) {
        dialogueContainer.style.display = 'block';
    }
}

// 格式化通话时长
function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0秒';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}小时`;
    if (minutes > 0) result += `${minutes}分钟`;
    if (secs > 0) result += `${secs}秒`;
    
    return result || '0秒';
}

// 格式化日期时间
function formatDateTime(timestamp) {
    if (!timestamp) return '-';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 获取通话状态文本
function getCallStatusText(status) {
    const statusMap = {
        '1': '接通',
        '2': '未接通',
        '3': '忙线',
        '4': '无应答',
        '5': '拒接'
    };
    
    return statusMap[status] || '未知';
}

// 初始化页面
function initRecordPage() {
    // 将HTML写入到页面
    document.open();
    document.write(createRecordHTML());
    document.close();
    
    // 页面加载后自动开始查询
    queryRecords();
}

// 如果在浏览器环境中直接运行
if (typeof window !== 'undefined') {
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRecordPage);
    } else {
        initRecordPage();
    }
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createRecordHTML,
        queryRecords,
        displayRecords,
        displayDialogue,
        formatDuration,
        formatDateTime,
        getCallStatusText,
        getUuidFromUrl,
        initRecordPage
    };
}