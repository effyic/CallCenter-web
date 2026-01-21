/**
 * 双向外呼页面：支持修改拨出号码并调用外呼接口
 */
(function () {
  'use strict';

  const CONFIG = {
    API_BASE: ''
  };

  /**
   * 解析路由参数
   */
  function getQueryParams () {
    const params = new URLSearchParams(window.location.search || '');
    return {
      uid: params.get('uid') || '',
      phone: params.get('phone') || '',
      tokenId: params.get('tokenId') || '',
      workTicketId: params.get('workTicketId') || '',
      userId: params.get('userId') || '',
      loginPhone: params.get('loginPhone') || ''
    };
  }

  /**
   * 手机号掩码处理：仅掩盖中间四位
   */
  function maskPhone (num) {
    if (!num || num.length < 7) return num || '';
    return num.replace(/(\d{3})\d{4}(\d+)/, '$1****$2');
  }

  /**
   * 根据uid获取用户信息
   */
  async function getUserInfoByUid (uid) {
    if (!uid) {
      throw new Error('用户ID不能为空');
    }

    try {
      console.log('正在获取用户信息，uid:', uid);

      const response = await fetch(`${CONFIG.API_BASE}/aicall/api/extension/usercode?userCode=${uid}`, {
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
        console.log('成功获取用户信息:', data.data);
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
  function validatePhoneNumber (phone) {
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
  function render () {
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
            <audio id="audioHandler" controls="controls" autoplay playsinline webkit-playsinline style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0"></audio>
          </div>
          <div style="text-align: center; margin-bottom: 30px;" class="auto-call-title-container">
            <div style="font-size: 24px; color: #122C4B; font-weight: 500;">智能客服系统</div>
            <div style="display: flex;align-items: center;gap:3px;" class="auto-call-title-row">
              <div class="auto-call-icon-container">
                <img src="images/icon/autocall.png" alt="" class="auto-call-icon">
              </div>
              <span class="auto-call-title-text" style="color:#0f9b7a;font-size:14px;font-weight:500;">自动外呼模式</span>
            </div>
          </div>

          <div style="margin-top: 64px; margin-bottom:30%;" class="auto-call-status-container">
            <img src="images/icon/call.png" alt="" class="auto-call-status-icon">
            <div id="autoCallStatus" style="text-align: center; color: #122C4B; font-size: 14px;line-height: 22px; width: 200px; font-weight: 500;">你将收到010 88150800的来电请注意接听</div>
            <div id="callStatus" style="text-align: center; color:#2FC77D; font-size: 16px; border-radius: 8px;">呼叫中</div>

            <div id="mainCallCard" style="position:absolute;margin-top: 28px; background: #fff; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); border-radius: 8px; padding: 26px 20px 20px; width: 320px; text-align: center;">
              <div style="color: #666; font-size: 14px; margin-bottom: 12px;">将使用该号码呼出</div>
              <div style="font-size: 30px; font-weight: 700; color: #122C4B; letter-spacing: 1px; margin-bottom: 12px;">${displayPhone}</div>
              <a id="modifyPhoneLink" style="font-size: 13px; color: #0f8bda; text-decoration: none; display: inline-block; margin-bottom: 16px; cursor: pointer;" href="javascript:void(0);">非本机号请修改 ></a>
              <div style="display: flex; justify-content: center; gap: 12px;">
                <button type="button" id="cancelCallBtn" style="flex: 1; padding: 10px 12px; border-radius: 4px; border: 1px solid #d9d9d9; background: #fff; color: #555; cursor: pointer; font-size: 14px;">取消</button>
                <button type="button" id="confirmCallBtn" style="flex: 1; padding: 10px 12px; border-radius: 4px; border: 1px solid #2d98da; background: #2d98da; color: #fff; cursor: pointer; font-size: 14px; box-shadow: 0 6px 15px rgba(45, 152, 218, 0.35);">立即呼叫</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 修改号码弹窗 -->
      <div id="phoneModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; align-items: center; justify-content: center;">
        <div style="background: #fff; border-radius: 8px; padding: 26px 20px 20px; width: 320px; text-align: center; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); position: relative;">
          <div style="color: #666; font-size: 14px; margin-bottom: 16px;">输入本机号码</div>
          <input type="text" id="phoneInput" placeholder="请输入电话号码" style="width: 100%; padding: 12px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 16px; margin-bottom: 8px; box-sizing: border-box; text-align: center;" />
          <div id="phoneError" style="color: #ff4757; font-size: 12px; margin-bottom: 12px; min-height: 18px; display: none;"></div>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <button type="button" id="modalCancelBtn" style="flex: 1; padding: 10px 12px; border-radius: 4px; border: 1px solid #d9d9d9; background: #fff; color: #555; cursor: pointer; font-size: 14px;">取消</button>
            <button type="button" id="modalConfirmBtn" style="flex: 1; padding: 10px 12px; border-radius: 4px; border: 1px solid #2d98da; background: #2d98da; color: #fff; cursor: pointer; font-size: 14px; box-shadow: 0 6px 15px rgba(45, 152, 218, 0.35);">立即呼叫</button>
          </div>
        </div>
      </div>
    </div>
    `;

    const elements = {
      cancelBtn: container.querySelector('#cancelCallBtn'),
      confirmBtn: container.querySelector('#confirmCallBtn'),
      modifyLink: container.querySelector('#modifyPhoneLink'),
      phoneModal: container.querySelector('#phoneModal'),
      modalCancelBtn: container.querySelector('#modalCancelBtn'),
      modalConfirmBtn: container.querySelector('#modalConfirmBtn'),
      phoneInput: container.querySelector('#phoneInput'),
      phoneError: container.querySelector('#phoneError'),
      autoCallStatus: container.querySelector('#autoCallStatus'),
      callStatus: container.querySelector('#callStatus'),
      mainCallCard: container.querySelector('#mainCallCard')
    };

    /**
     * 隐藏外层卡片
     */
    function hideMainCard () {
      if (elements.mainCallCard) {
        elements.mainCallCard.style.display = 'none';
      }
    }

    /**
     * 显示错误提示
     */
    function showError (message) {
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
    function clearError () {
      if (elements.phoneError) {
        elements.phoneError.textContent = '';
        elements.phoneError.style.display = 'none';
        if (elements.phoneInput) {
          elements.phoneInput.style.borderColor = '#d9d9d9';
        }
      }
    }

    /**
     * 显示弹窗
     */
    function showModal () {
      if (elements.phoneModal) {
        elements.phoneModal.style.display = 'flex';
        clearError();
        if (elements.phoneInput) {
          setTimeout(() => elements.phoneInput.focus(), 100);
        }
      }
    }

    /**
     * 隐藏弹窗
     */
    function hideModal () {
      if (elements.phoneModal) {
        elements.phoneModal.style.display = 'none';
        if (elements.phoneInput) {
          elements.phoneInput.value = '';
        }
        clearError();
      }
    }

    /**
     * 统一外呼函数
     */
    async function triggerCall (validPhone) {
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
        console.log('获取用户信息成功，extNum:', extNum);

        // 构建查询参数
        const queryParams = new URLSearchParams({
          phone1: validPhone,
          phone2: routeParams.phone || '',
          workTicketId: routeParams.workTicketId || '',
          ext: extNum
        });

        const url = CONFIG.API_BASE +  '/call-center/conferenceDualNoModerator?' + queryParams.toString();
        console.log('调用外呼接口:', url);

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json().catch(() => ({}));
        console.log('外呼接口响应:', res.status, data);

        if (!res.ok) {
          throw new Error(data.message || `接口返回错误，状态码 ${res.status}`);
        }

        // 成功后才关闭弹窗和卡片
        hideModal();
        hideMainCard();
      } catch (err) {
        console.error('外呼接口调用失败:', err);

        // 如果是获取分机号失败，在弹窗中显示错误
        if (err.message.includes('uid') || err.message.includes('分机号')) {
          showError(err.message);
          // 不关闭弹窗，让用户可以重试
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
        const phoneNumber = elements.phoneInput ? elements.phoneInput.value.trim() : '';
        const validation = validatePhoneNumber(phoneNumber);

        if (!validation.valid) {
          showError(validation.message);
          return;
        }

        clearError();
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
          showError(validation.message);
          return;
        }

        clearError();
        await triggerCall(validation.phone);
      });
    }

    // 输入框事件
    if (elements.phoneInput) {
      // 输入时清除错误提示
      elements.phoneInput.addEventListener('input', clearError);

      // 支持回车键提交
      elements.phoneInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && elements.modalConfirmBtn) {
          elements.modalConfirmBtn.click();
        }
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
