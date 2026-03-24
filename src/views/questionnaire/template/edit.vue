<template>
  <div class="questionnaire-edit-page">

    <!-- 左侧工具栏 -->
    <div class="left-sidebar">
      <div class="back">
        <el-button type="primary" @click="handleBack" text>
          <el-icon>
            <Back />
          </el-icon>返回
        </el-button>
      </div>

      <div class="tool-section">
        <div class="tool-title">选择题</div>
        <div class="tool-buttons">
          <el-button size="small" @click="addQuestion('radio')">
            <el-icon>
              <CircleCheck />
            </el-icon>单选题
          </el-button>
          <el-button size="small" @click="addQuestion('checkbox')">
            <el-icon>
              <Finished />
            </el-icon>多选题
          </el-button>
          <el-button size="small" @click="addQuestion('imageRadio')">
            <el-icon>
              <Picture />
            </el-icon>图片单选
          </el-button>
          <el-button size="small" @click="addQuestion('imageCheckbox')">
            <el-icon>
              <PictureFilled />
            </el-icon>图片多选
          </el-button>
        </div>
      </div>

      <div class="tool-section">
        <div class="tool-title">输入题</div>
        <div class="tool-buttons">
          <el-button size="small" @click="addQuestion('fillblank')">
            <el-icon>
              <EditPen />
            </el-icon>填空题
          </el-button>
          <el-button size="small" @click="addQuestion('textarea')">
            <el-icon>
              <ChatDotRound />
            </el-icon>问答题
          </el-button>
        </div>
      </div>

      <div class="tool-section">
        <div class="tool-title">投票题</div>
        <div class="tool-buttons">
          <el-button size="small" @click="addQuestion('voteText')">
            <el-icon>
              <Document />
            </el-icon>文字投票
          </el-button>
          <el-button size="small" @click="addQuestion('voteImage')">
            <el-icon>
              <Picture />
            </el-icon>图片投票
          </el-button>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-title">适用对象</div>
        <div class="tool-buttons">
          <el-radio-group v-model="formData.target">
            <el-radio-button label="学生">学生</el-radio-button>
            <el-radio-button label="家长">家长</el-radio-button>
            <el-radio-button label="企业">企业</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-title">状态</div>
        <div class="tool-buttons">
          <el-radio-group v-model="formData.status">
            <el-radio label="启用">启用</el-radio>
            <el-radio label="不启用">不启用</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>

    <!-- 中间编辑区 -->
    <div class="edit-area">
      <!-- 标题区域 -->
      <div class="title-section">
        <el-input v-model="formData.title" placeholder="请输入标题" class="title-input" />
        <div class="rich-editor">
          <div class="editor-toolbar">
            <el-button text size="small">字号</el-button>
            <el-button text size="small"><b>B</b></el-button>
            <el-button text size="small"><i>I</i></el-button>
            <el-button text size="small"><u>U</u></el-button>
            <el-button text size="small">A</el-button>
            <el-divider direction="vertical" />
            <el-button text size="small"><el-icon>
                <List />
              </el-icon></el-button>
            <el-button text size="small"><el-icon>
                <Sort />
              </el-icon></el-button>
            <el-button text size="small"><el-icon>
                <Grid />
              </el-icon></el-button>
            <el-divider direction="vertical" />
            <el-button text size="small"><el-icon>
                <TopLeft />
              </el-icon></el-button>
            <el-button text size="small"><el-icon>
                <Top />
              </el-icon></el-button>
            <el-button text size="small"><el-icon>
                <TopRight />
              </el-icon></el-button>
            <el-button text size="small"><el-icon>
                <Picture />
              </el-icon></el-button>
          </div>
          <el-input v-model="formData.description" type="textarea" :rows="8" placeholder="请输入问卷说明..."
            class="editor-content" />
        </div>
      </div>

      <!-- 题目列表 -->
      <div class="question-list">
        <div v-for="(question, index) in formData.questions" :key="question.id" class="question-item">
          <div class="question-header">
            <span class="question-index">{{ index + 1 }}.</span>
            <el-input v-model="question.title" placeholder="请输入题目" class="question-title-input" />
            <el-button type="danger" link size="small" @click="removeQuestion(index)">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
          <div class="question-options">
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
              <el-radio v-if="question.type === 'radio'" :label="optIndex" disabled>
                <el-input v-model="option.text" placeholder="选项内容" size="small" />
              </el-radio>
              <el-checkbox v-else-if="question.type === 'checkbox'" :label="optIndex" disabled>
                <el-input v-model="option.text" placeholder="选项内容" size="small" />
              </el-checkbox>
              <el-input v-else-if="question.type === 'fillblank' || question.type === 'textarea'" placeholder="请输入答案"
                disabled size="small" />
              <el-button v-if="question.type === 'radio' || question.type === 'checkbox'" type="danger" link
                size="small" @click="removeOption(question, optIndex)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
            <el-button v-if="question.type === 'radio' || question.type === 'checkbox'" type="primary" link size="small"
              @click="addOption(question)">
              + 添加选项
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部保存按钮 -->
    <div class="bottom-bar">
      <el-button type="primary" size="large" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  CircleCheck,
  Finished,
  Picture,
  PictureFilled,
  EditPen,
  ChatDotRound,
  Document,
  List,
  Sort,
  Grid,
  TopLeft,
  Top,
  TopRight,
  Delete,
  Back
} from '@element-plus/icons-vue'

const router = useRouter()

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  target: '学生',
  status: '启用',
  questions: []
})

// 添加题目
const addQuestion = (type) => {
  const question = {
    id: Date.now(),
    type,
    title: '',
    options: []
  }

  // 选择题默认添加2个选项
  if (type === 'radio' || type === 'checkbox') {
    question.options = [
      { text: '' },
      { text: '' }
    ]
  }

  formData.questions.push(question)
}

// 删除题目
const removeQuestion = (index) => {
  formData.questions.splice(index, 1)
}

// 添加选项
const addOption = (question) => {
  question.options.push({ text: '' })
}

// 删除选项
const removeOption = (question, index) => {
  question.options.splice(index, 1)
}

// 保存
const handleSave = () => {
  console.log('保存问卷模板:', formData)
  router.back()
}

// 返回
const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.questionnaire-edit-page {
  display: flex;
  height: calc(100vh - 84px);
  background-color: #f5f7fa;
  position: relative;
}

/* 左侧工具栏 */
.back {
  display: flex;
  justify-content: flex-end;
}

.left-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  padding: 20px;
  overflow-y: auto;
}


.tool-section {
  margin-bottom: 20px;
}

.tool-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.el-radio-group {
  flex-wrap: nowrap;
}

.tool-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.el-button+.el-button {
  margin-left: 0
}

.tool-buttons .el-button {
  flex: 1;
  justify-content: flex-start;
}

.tool-buttons .el-icon {
  margin-right: 4px;
}


/* 中间编辑区 */
.edit-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.title-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.title-input {
  margin-bottom: 15px;
}

.title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
}

.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.editor-toolbar {
  display: flex;
  align-items: center;

  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.editor-toolbar .el-button {
  padding: 4px 8px;
  margin-right: 4px;
}

.editor-content :deep(.el-textarea__inner) {
  border: none;
  resize: none;
}

/* 题目列表 */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-item {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.question-index {
  font-weight: 600;
  margin-right: 8px;
  color: #303133;
}

.question-title-input {
  flex: 1;
  margin-right: 10px;
}

.question-options {
  padding-left: 24px;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-item .el-input {
  width: 300px;
  margin-left: 8px;
}


/* 底部保存按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 200px;
  right: 200px;
  height: 60px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
</style>
