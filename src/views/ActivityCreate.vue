<template>
  <div class="page-container">
    <!-- 页面头部 - 移除返回按钮 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-header-left">
          <h1>发布新活动</h1>
          <p class="page-header-subtitle">创建校园活动，与学生和教职工分享</p>
        </div>
        <div class="page-header-actions">
          <button @click="$router.push('/admin/activities')" class="btn btn-secondary">
            活动管理
          </button>
          <button @click="$router.push('/activities')" class="btn btn-view">
            查看活动
          </button>
        </div>
      </div>
    </div>

    <!-- 主表单容器 -->
    <div class="form-container">
      <div class="form-card">
        <!-- 表单头部 -->
        <div class="form-header">
          <h2>活动信息</h2>
          <p class="form-tips">带 <span class="required-star">*</span> 号为必填项</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="activity-form">
          <!-- 基础信息 -->
          <div class="form-section">
            <div class="section-header">
              <h3>基础信息</h3>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                活动名称 <span class="required-star">*</span>
              </label>
              <div class="input-with-icon">
                <span class="input-icon">A</span>
                <input
                  v-model="form.title"
                  placeholder="请输入活动名称，如：春季运动会"
                  class="form-input"
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                活动介绍 <span class="required-star">*</span>
              </label>
              <div class="textarea-with-icon">
                <span class="input-icon">D</span>
                <textarea
                  v-model="form.description"
                  placeholder="请详细描述活动内容、流程和注意事项..."
                  class="form-textarea"
                  rows="5"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- 时间地点 -->
          <div class="form-section">
            <div class="section-header">
              <h3>时间与地点</h3>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  开始时间 <span class="required-star">*</span>
                </label>
                <div class="input-with-icon">
                  <span class="input-icon">T</span>
                  <input
                    v-model="form.startTime"
                    type="datetime-local"
                    class="form-input"
                    required
                  >
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">
                  结束时间 <span class="required-star">*</span>
                </label>
                <div class="input-with-icon">
                  <span class="input-icon">T</span>
                  <input
                    v-model="form.endTime"
                    type="datetime-local"
                    class="form-input"
                    required
                  >
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  活动地点 <span class="required-star">*</span>
                </label>
                <div class="input-with-icon">
                  <span class="input-icon">L</span>
                  <input
                    v-model="form.location"
                    placeholder="请输入具体地点，如：学校体育馆"
                    class="form-input"
                    required
                  >
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">
                  组织单位 <span class="required-star">*</span>
                </label>
                <div class="input-with-icon">
                  <span class="input-icon">O</span>
                  <input
                    v-model="form.organizer"
                    placeholder="请输入主办单位名称"
                    class="form-input"
                    required
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 报名设置 -->
          <div class="form-section">
            <div class="section-header">
              <h3>报名设置</h3>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  最大报名人数 <span class="required-star">*</span>
                </label>
                <div class="input-with-icon">
                  <span class="input-icon">P</span>
                  <input
                    v-model="form.maxParticipants"
                    type="number"
                    min="1"
                    placeholder="请输入人数限制"
                    class="form-input"
                    required
                  >
                </div>
                <p class="input-hint">建议根据场地容量设置</p>
              </div>
              <div class="form-group">
                <label class="form-label">活动状态</label>
                <div class="select-with-icon">
                  <span class="input-icon">S</span>
                  <select v-model="form.status" class="form-input">
                    <option value="PUBLISHED">立即发布</option>
                    <option value="DRAFT">保存草稿</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <div class="action-buttons">
              <button type="submit" :disabled="loading" class="btn-submit">
                {{ loading ? '发布中...' : form.status === 'PUBLISHED' ? '发布活动' : '保存草稿' }}
              </button>
              <button type="button" @click="$router.back()" class="btn-cancel">
                取消
              </button>
            </div>
            <p class="form-help">
              发布后可在活动管理页面修改
            </p>
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// JavaScript部分完全保持不变
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const loading = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
  organizer: '',
  maxParticipants: 10,
  status: 'PUBLISHED'
})

const handleSubmit = async () => {
  // 表单验证（保持不变）
  if (!form.title.trim()) {
    error.value = '请输入活动名称'
    return
  }
  if (!form.description.trim()) {
    error.value = '请输入活动介绍'
    return
  }
  if (!form.startTime || !form.endTime) {
    error.value = '请选择活动时间'
    return
  }
  if (new Date(form.startTime) >= new Date(form.endTime)) {
    error.value = '结束时间必须晚于开始时间'
    return
  }
  if (!form.location.trim()) {
    error.value = '请输入活动地点'
    return
  }
  if (!form.organizer.trim()) {
    error.value = '请输入组织单位'
    return
  }
  if (!form.maxParticipants || form.maxParticipants < 1) {
    error.value = '请输入有效的报名人数'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await axios.post('/api/activities', form)
    if (response.status === 200) {
      alert('活动发布成功！')
      router.push('/admin/activities')
    }
  } catch (err) {
    error.value = err.response?.data?.message || '发布失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 修复页面背景色 */
.page-container {
  background: white !important;
  background-color: white !important;
}

.activity-create {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* 页面头部 */
.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back:hover {
  background: #f3db60;
}

.header-title h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary, .btn-view {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-secondary {
  background: var(--brand-highlight);
  color: #222;
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: #f3db60;
}

.btn-view {
  background: var(--brand-primary);
  color: white;
}

.btn-view:hover {
  background: #6aa3d6;
}

/* 主表单容器 */
.form-container {
  max-width: 1000px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 6px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.form-header h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.form-tips {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}

.required-star {
  color: #f56c6c;
  font-weight: bold;
}

/* 表单部分 */
.form-section {
  margin-bottom: 32px;
  padding: 20px;
  background: var(--bg-soft);
  border-radius: 4px;
  border-left: 4px solid var(--brand-primary);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.section-header h3 {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
}

.input-with-icon, .textarea-with-icon, .select-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--brand-primary);
  font-weight: bold;
  font-size: 14px;
  z-index: 1;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.5;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(131, 183, 225, 0.2);
}

.input-hint {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 6px;
  margin-left: 8px;
}

/* 选择框特殊样式 */
select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2383B7E1' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
  padding-right: 32px;
}

/* 表单操作 */
.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}

.btn-submit, .btn-cancel {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 140px;
}

.btn-submit {
  background: var(--brand-primary);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #6aa3d6;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: var(--text-muted);
}

.form-help {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}

/* 错误消息 */
.error-message {
  margin-top: 20px;
  padding: 12px 16px;
  background: #fef0f0;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  color: #f56c6c;
  text-align: center;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-create {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-secondary, .btn-view {
    flex: 1;
  }
  
  .form-card {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-submit, .btn-cancel {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .activity-create {
    padding: 12px;
  }
  
  .form-card {
    padding: 16px;
  }
  
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .form-header h2 {
    font-size: 16px;
  }
}
</style>