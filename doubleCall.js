/**
 * 双向外呼页面：支持修改拨出号码并调用外呼接口
 */
(function () {
  'use strict';

  const CONFIG = {
    API_BASE: ''
  };

  let pollingTimer = null;

  /**
   * 解析路由参数
   */
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search || '');

    // fix: 防止 XSS 攻击
    const sanitize = str => (str || '').replace(/[<>"'&]/g, '');

    return {
      uid: sanitize(params.get('uid')),
      phone: sanitize(params.get('phone')),
      tokenId: sanitize(params.get('tokenId')),
      workTicketId: sanitize(params.get('workTicketId')),
      userId: sanitize(params.get('userId')),
      loginPhone: sanitize(params.get('loginPhone'))
    };
  }

  /**
   * 手机号掩码处理：仅掩盖中间四位
   */
  function maskPhone(num) {
    if (!num || num.length < 7) return num || '';
    return num.replace(/(\d{3})\d{4}(\d+)/, '$1****$2');
  }

  /**
   * HTML 转义函数，防止 XSS 攻击
   */
  function escapeHTML(str) {
    if (!str) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 格式化通话时长 (秒 -> mm:ss)
   */
  function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 根据uid获取用户信息
   */
  async function getUserInfoByUid(uid) {
    if (!uid) {
      throw new Error('用户ID不能为空');
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE}/aicall/api/extension/usercode?userCode=${encodeURIComponent(uid)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`服务器响应错误，状态码: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 0 && data.data) {
        return {
          extNum: data.data.extNum,
          extPass: data.data.extPass,
          userCode: data.data.userCode
        };
      } else {
        throw new Error(data.msg || '获取用户信息失败，请检查用户ID是否正确');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);

      // 根据错误类型提供更友好的错误信息
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络连接或联系管理员');
      } else if (error.message.includes('状态码')) {
        throw new Error('服务器暂时不可用，请稍后重试');
      } else {
        throw error;
      }
    }
  }

  /**
   * 手机号校验函数（只允许11位手机号）
   */
  function validatePhoneNumber(phone) {
    const cleanedPhone = phone.replace(/\s|-/g, '');

    if (!cleanedPhone || cleanedPhone.trim() === '') {
      return { valid: false, message: '请输入手机号码' };
    }

    if (!/^\d+$/.test(cleanedPhone)) {
      return { valid: false, message: '手机号码只能包含数字' };
    }

    if (cleanedPhone.length !== 11) {
      return { valid: false, message: '请输入11位手机号码' };
    }

    if (!/^1[3-9]\d{9}$/.test(cleanedPhone)) {
      return { valid: false, message: '请输入正确的手机号码格式' };
    }

    return { valid: true, phone: cleanedPhone };
  }

  /**
   * 渲染主界面
   */
  function render() {
    const container = document.getElementById('phone-bar') || document.body;
    if (!container) {
      console.warn('未找到可用的容器 #phone-bar 或 body，渲染跳过');
      return;
    }

    const routeParams = getQueryParams();
    // 优先使用 loginPhone，否则回退到 phone
    const rawDisplayPhone = routeParams.loginPhone || routeParams.phone || '';
    const displayPhone = maskPhone(rawDisplayPhone);

    // 构建静态内容
    container.innerHTML = `
    <div style="max-width: 100%; max-height: 100vh; background: linear-gradient(180deg, #C5D1EC 0%, #EFF0F3 42.79%, #FFFFFF 100%); padding: 0; box-sizing: border-box;">
      <div style="padding: 20px 24px; height: 100vh; box-sizing: border-box;" class="auto-call-container-box">
        <div class="auto-call-container">
          <div>
            <audio id="audioHandler" controls="controls" autoplay playsinline webkit-playsinline style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0;"></audio>
          </div>
          <div style="text-align: center; margin-bottom: 30px;" class="auto-call-title-container">
            <div style="font-size: 24px; color: #122C4B; font-weight: 500;">智能客服系统</div>
            <div style="display: flex; align-items: center; gap: 3px;" class="auto-call-title-row">
              <div class="auto-call-icon-container">
                <img src="images/icon/autocall.png" alt="" class="auto-call-icon">
              </div>
              <span class="auto-call-title-text" style="color: #0f9b7a; font-size: 14px; font-weight: 500;">外呼模式</span>
            </div>
          </div>

          <div style="margin-top: 64px; margin-bottom: 30%;" class="auto-call-status-container">
            <img src="images/icon/call.png" alt="" class="auto-call-status-icon">
            <div id="autoCallStatus" style="text-align: center; color: #122C4B; font-size: 12px; line-height: 22px; width: 200px; font-weight: 500; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;">
              你将收到
              <div style="font-size: 24px; font-weight: 500; color: #122C4B; line-height: 34px;">
                010 88150800
              </div>
              来电请注意接听
            </div>
            <div id="callStatus" style="text-align: center; color: #122C4BCC; font-size: 16px; border-radius: 8px;">呼叫中...</div>
            <div id="callDuration" style="text-align: center; color: #122C4B; font-size: 20px; font-weight: 600; margin-top: -10px; display: none;">00:00</div>
          </div>
        </div>
      </div>
      <div id="mainCallCard" style="position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); background: #fff; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); border-radius: 12px; padding: 32px 24px; width: 280px; text-align: center; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; z-index: 999;">
        <img src="images/icon/dialogIcon.png" alt="" style="width: 96px; height: 96px; z-index: 1;">
        <div style="color: #333; font-size: 14px; margin: 16px 0 8px; line-height: 20px;">将使用该号码呼出</div>
        <div id="displayPhone" style="font-size: 28px; font-weight: 600; color: #333; line-height: 40px;"></div>
        <div style="display: flex; justify-content: center; gap: 9px; margin: 32px 0 16px; width: 80%;">
          <button type="button" id="confirmCallBtn" style="flex: 1; height: 40px; border-radius: 20px; border: none; background: #4D98D5; color: #fff; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">立即呼叫</button>
        </div>
      </div>
      <!-- 修改号码弹窗 -->
      <div id="phoneModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; align-items: center; justify-content: center;">
        <div style="background: #fff; border-radius: 12px; padding: 32px 24px; width: 280px; text-align: center; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; align-items: center; box-sizing: border-box; position: relative;">
          <div style="position: relative; width: 100%; margin-bottom: 8px;">
            <button id="closeModalBtn" style="position: absolute; top: -8px; right: -8px; background: none; border: none; color: #4545454D; font-size: 20px; cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; z-index: 10;">×</button>
          </div>
          <div style="color: #333; font-size: 16px; font-weight: 500; margin: 0 0 20px; line-height: 22px;">修改为本机号码</div>
          <input type="text" id="phoneInput" placeholder="请输入本机号码" style="width: 100%; padding: 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 16px; margin-bottom: 8px; box-sizing: border-box; text-align: center; outline: none; transition: border-color 0.2s;" />
          <div id="phoneError" style="color: #ff4757; font-size: 12px; margin-bottom: 12px; min-height: 18px; display: none; text-align: left; padding-left: 4px; width: 100%;"></div>
          <div style="display: flex; justify-content: center; gap: 9px; margin: 8px 0 0; width: 100%;">
            <button type="button" id="modalCancelBtn" style="flex: 1; height: 40px; border-radius: 20px; border: none; background: #D6D6D6; color: #666; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer;">取消</button>
            <button type="button" id="modalConfirmBtn" style="flex: 1; height: 40px; border-radius: 20px; border: none; background: #4D98D5; color: #fff; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">立即呼叫</button>
          </div>
        </div>
      </div>
    </div>
    `;

    const elements = {
      confirmBtn: container.querySelector('#confirmCallBtn'),
      phoneModal: container.querySelector('#phoneModal'),
      modalCancelBtn: container.querySelector('#modalCancelBtn'),
      modalConfirmBtn: container.querySelector('#modalConfirmBtn'),
      phoneInput: container.querySelector('#phoneInput'),
      phoneError: container.querySelector('#phoneError'),
      autoCallStatus: container.querySelector('#autoCallStatus'),
      callStatus: container.querySelector('#callStatus'),
      callDuration: container.querySelector('#callDuration'),
      mainCallCard: container.querySelector('#mainCallCard'),
      closeModalBtn: container.querySelector('#closeModalBtn'),
      displayPhoneEl: container.querySelector('#displayPhone')
    };

    // 为了彻底避免基于 DOM 的 XSS，将来自 URL 的号码只通过 textContent 写入
    if (elements.displayPhoneEl) {
      // 仅允许数字、空格和星号，其他字符全部丢弃
      const safeDisplayPhone = (displayPhone || '').replace(/[^\d*\s]/g, '');
      elements.displayPhoneEl.textContent = safeDisplayPhone;
    }

    /**
     * 隐藏外层卡片
     */
    function hideMainCard() {
      if (elements.mainCallCard) {
        elements.mainCallCard.style.display = 'none';
      }
    }

    /**
     * 显示错误提示
     */
    function showError(message) {
      if (elements.phoneError) {
        elements.phoneError.textContent = message;
        elements.phoneError.style.display = 'block';
        if (elements.phoneInput) {
          elements.phoneInput.style.borderColor = '#ff4757';
        }
      }
    }

    /**
     * 清除错误提示
     */
    function clearError() {
      if (elements.phoneError) {
        elements.phoneError.textContent = '';
        elements.phoneError.style.display = 'none';
        if (elements.phoneInput) {
          elements.phoneInput.style.borderColor = '#d9d9d9';
        }
      }
    }

    /**
     * 更新立即呼叫按钮状态
     */
    function updateCallButtonState(isValid) {
      if (elements.modalConfirmBtn) {
        if (isValid) {
          elements.modalConfirmBtn.disabled = false;
          elements.modalConfirmBtn.style.background = '#4D98D5';
          elements.modalConfirmBtn.style.cursor = 'pointer';
        } else {
          elements.modalConfirmBtn.disabled = true;
          elements.modalConfirmBtn.style.background = '#4D98D599';
          elements.modalConfirmBtn.style.cursor = 'not-allowed';
        }
      }
    }

    /**
     * 显示弹窗
     */
    function showModal() {
      if (elements.phoneModal) {
        elements.phoneModal.style.display = 'flex';
        clearError();
        if (elements.phoneInput) {
          setTimeout(() => {
            elements.phoneInput.focus();
            // 检查初始状态
            const phoneNumber = elements.phoneInput.value.trim();
            const validation = validatePhoneNumber(phoneNumber);
            updateCallButtonState(validation.valid);
          }, 100);
        } else {
          // 如果没有输入框，默认禁用按钮
          updateCallButtonState(false);
        }
      }
    }

    /**
     * 隐藏弹窗
     */
    function hideModal() {
      if (elements.phoneModal) {
        elements.phoneModal.style.display = 'none';
        if (elements.phoneInput) {
          elements.phoneInput.value = '';
        }
        clearError();
        // 重置按钮状态
        updateCallButtonState(false);
      }
    }

    /**
     * 停止轮询
     */
    function stopPolling() {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    }

    /**
     * 开始轮询呼叫状态
     */
    function startPolling(uuid) {
      stopPolling();

      pollingTimer = setInterval(async () => {
        try {
          const response = await fetch(CONFIG.API_BASE + '/aicall/api/records/list', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              uuid: uuid,
              callType: '03'
            })
          });

          if (!response.ok) return;

          const result = await response.json();
          if (result.code === 0 && result.rows && result.rows.length > 0) {
            const record = result.rows[0];

            if (elements.callStatus) {
              elements.callStatus.textContent = '通话已结束';
            }

            if (elements.callDuration) {
              elements.callDuration.textContent = formatDuration(record.timeLen);
              elements.callDuration.style.display = 'block';
            }

            // 获取到数据（通话结束）后停止轮询
            stopPolling();
          }
        } catch (error) {
          // 通话过程中可能出现断网，静默处理查询失败
        }
      }, 1000);
    }

    /**
     * 统一外呼函数
     */
    async function triggerCall(validPhone) {
      try {
        // 必须提供uid才能获取分机号
        if (!routeParams.uid) {
          throw new Error('缺少uid参数，无法获取分机号');
        }

        // 获取用户信息
        const userInfo = await getUserInfoByUid(routeParams.uid);
        if (!userInfo || !userInfo.extNum) {
          throw new Error('无法获取分机号信息');
        }

        const extNum = userInfo.extNum;

        // 构建查询参数
        const queryParams = new URLSearchParams({
          phone1: validPhone,
          phone2: routeParams.phone || '',
          workTicketId: routeParams.workTicketId || '',
          ext: extNum
        });

        const url = CONFIG.API_BASE + '/call-center/conferenceDualNoModerator?' + queryParams.toString();

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await res.text().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || `接口返回错误，状态码 ${res.status}`);
        }

        // 获取 uuid 并开始轮询
        if (data) {
          startPolling(data);
        }

        // 成功后才关闭弹窗和卡片
        hideModal();
        hideMainCard();
      } catch (err) {
        console.error('外呼接口调用失败:', err);

        // 如果是获取分机号失败，不关闭弹窗，让用户可以重试
        if (err.message.includes('uid') || err.message.includes('分机号')) {
          // 不显示错误提示，只记录日志
          return;
        }

        // 其他错误显示在主界面
        if (elements.autoCallStatus) {
          elements.autoCallStatus.textContent = '呼叫失败，请重试';
        }
        if (elements.callStatus) {
          elements.callStatus.textContent = '呼叫失败';
          elements.callStatus.style.color = '#E0544E';
        }

        // 接口调用失败时也关闭弹窗和卡片
        hideModal();
        hideMainCard();
      }
    }


    // 取消按钮
    if (elements.cancelBtn) {
      elements.cancelBtn.addEventListener('click', function () {
        console.log('取消按钮被点击');
        window.history.back();
      });
    }

    // 修改号码链接
    if (elements.modifyLink) {
      elements.modifyLink.addEventListener('click', function (e) {
        e.preventDefault();
        showModal();
      });
    }

    // 弹窗取消按钮
    if (elements.modalCancelBtn) {
      elements.modalCancelBtn.addEventListener('click', function () {
        hideModal();
      });
    }

    // 弹窗立即呼叫按钮
    if (elements.modalConfirmBtn) {
      elements.modalConfirmBtn.addEventListener('click', async function () {
        // 如果按钮被禁用，不执行任何操作
        if (this.disabled) {
          return;
        }

        const phoneNumber = elements.phoneInput ? elements.phoneInput.value.trim() : '';
        const validation = validatePhoneNumber(phoneNumber);

        if (!validation.valid) {
          return;
        }

        await triggerCall(validation.phone);
      });
    }

    // 外层立即呼叫按钮
    if (elements.confirmBtn) {
      elements.confirmBtn.addEventListener('click', async function () {
        const phoneNumber = rawDisplayPhone;
        const validation = validatePhoneNumber(phoneNumber || '');

        if (!validation.valid) {
          showModal();
          return;
        }

        await triggerCall(validation.phone);
      });
    }

    // 输入框事件
    if (elements.phoneInput) {
      // 输入时实时校验并更新按钮状态
      elements.phoneInput.addEventListener('input', function () {
        const phoneNumber = this.value.trim();
        const validation = validatePhoneNumber(phoneNumber);
        updateCallButtonState(validation.valid);
        clearError();
      });

      // 支持回车键提交（仅在按钮启用时）
      elements.phoneInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && elements.modalConfirmBtn && !elements.modalConfirmBtn.disabled) {
          elements.modalConfirmBtn.click();
        }
      });
    }


    // 关闭弹窗按钮
    if (elements.closeModalBtn) {
      elements.closeModalBtn.addEventListener('click', function () {
        hideModal();
      });
    }

    // 点击弹窗背景关闭弹窗
    if (elements.phoneModal) {
      elements.phoneModal.addEventListener('click', function (e) {
        if (e.target === elements.phoneModal) {
          hideModal();
        }
      });
    }

    // 添加按钮hover效果样式
    const style = document.createElement('style');
    style.textContent = `
      #confirmCallBtn:hover, #modalConfirmBtn:hover {
        background: #2589c7 !important;
        box-shadow: 0 4px 12px rgba(45, 152, 218, 0.4) !important;
        transform: translateY(-1px);
      }
      #closeMainCardBtn:hover, #closeModalBtn:hover {
        color: #333 !important;
        background: #f5f5f5 !important;
        border-radius: 50%;
      }
      #phoneInput:focus {
        border-color: #2d98da !important;
      }
    `;
    document.head.appendChild(style);

    // 提供给外部调用的空 init（已渲染，无需额外逻辑）
    if (typeof window !== 'undefined') {
      window.init = function () { };
    }
  }

  // ==================== 初始化 ====================

  // 确保在 DOM Ready 后渲染，避免 container 为空
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, { once: true });
  } else {
    render();
  }
})();
