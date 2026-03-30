<template>
  <div class="page-container">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{}"
      :actions="{}"
      :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
    >
      <!-- 自定义姓名列 - 显示link图标+姓名 -->
      <template #name="{ row }">
        <span class="name-link" @click="handleView(row)">
          <el-icon class="link-icon"><Link /></el-icon>
          <span class="name-text">{{ row.name }}</span>
        </span>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd" plain>添加单个学生</el-button>
        <el-button type="primary" @click="handleImport" plain>批量选择</el-button>
        <el-button type="primary" @click="handleExportManual" plain>批量导出实习手册</el-button>
        <el-button type="primary" @click="handleExportRoster" plain>导出实习学生名册</el-button>
        <el-button type="primary" @click="handleExportApproval" plain>导出实习审批表</el-button>
        <el-button type="primary" @click="handleExportGraduates" plain>导出毕业生名册(就业调查)</el-button>
        <el-button type="primary" @click="handleExportClassification" plain>毕业生分类表(就业调查)</el-button>
        <el-button type="primary" @click="handleExportManagement" plain>实习管理表导出</el-button>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">修改</el-button>
        <el-button type="warning" link @click="handleResetPassword(row)">重置密码</el-button>
        <el-button type="success" link @click="handleManual(row)">实习手册</el-button>
        <el-button type="info" link @click="handleInformationCollection(row)">信息采集</el-button>
      </template>
    </Crud>

    <!-- 学生详细信息弹框 -->
    <Dialog
      ref="dialogRef"
      v-model="detailDialogVisible"
      title="学生详细信息"
      width="900px"
      :show-footer="dialogMode !== 'view'"
      :show-form="true"
      :form-fields="formFields"
      :form-data="formData"
      :view-mode="dialogMode === 'view'"
      @confirm="handleConfirm"
      @update:form-data="formData = $event"
      @close="handleDialogClose"
    >
      <template #footer v-if="dialogMode !== 'view'">
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">保存</el-button>
      </template>
    </Dialog>

    <!-- 信息采集弹框 -->
    <Dialog
      ref="infoDialogRef"
      v-model="infoCollectionVisible"
      title="信息采集"
      width="800px"
      :show-footer="true"
      :confirm-text="'保存'"
      :cancel-text="'取消'"
      @confirm="handleSaveCollection"
    >
      <el-tabs v-model="activeTab" type="card">
        <!-- 信息采集 -->
        <el-tab-pane label="信息采集" name="collection">
          <BaseForm
            ref="collectionFormRef"
            v-model="collectionData"
            :fields="collectionFields"
            :rules="collectionRules"
            label-width="120px"
            :show-buttons="false"
          />
        </el-tab-pane>

        <!-- 生源信息表 -->
        <el-tab-pane label="生源信息表" name="source">
          <BaseForm
            ref="sourceFormRef"
            v-model="sourceData"
            :fields="sourceFields"
            :rules="sourceRules"
            label-width="120px"
            :show-buttons="false"
          />
        </el-tab-pane>

        <!-- 就业推荐表 -->
        <el-tab-pane label="就业推荐表" name="recommendation">
          <BaseForm
            ref="recommendationFormRef"
            v-model="recommendationData"
            :fields="recommendationFields"
            :rules="recommendationRules"
            label-width="120px"
            :show-buttons="false"
          />
        </el-tab-pane>

        <!-- 毕业去向表 -->
        <el-tab-pane label="毕业去向表" name="graduation">
          <BaseForm
            ref="graduationFormRef"
            v-model="graduationData"
            :fields="graduationFields"
            :rules="graduationRules"
            label-width="120px"
            :show-buttons="false"
          />
        </el-tab-pane>
      </el-tabs>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import BaseForm from '@/components/Form/index.vue'
import { Link } from '@element-plus/icons-vue'

const crudRef = ref(null)
const dialogRef = ref(null)
const detailDialogVisible = ref(false)
const dialogMode = ref('view')

// 信息采集弹框
const infoDialogRef = ref(null)
const infoCollectionVisible = ref(false)
const activeTab = ref('collection')
const collectionFormRef = ref(null)
const sourceFormRef = ref(null)
const recommendationFormRef = ref(null)
const graduationFormRef = ref(null)

// 表单数据
const formData = reactive({
  studentName: '',
  phone: '',
  studentId: '',
  studentCardNo: '',
  idCardType: '身份证',
  idCard: '',
  gender: '男',
  birthday: '',
  nation: '',
  politicalStatus: '',
  enrollmentDate: '',
  graduationDate: '',
  foreignLanguage: '',
  foreignLanguageLevel: '',
  householdLocation: '',
  householdNature: '',
  nativePlace: '',
  familyZipCode: '',
  familyAddress: '',
  location: '',
  locationAddress: '',
  qqNumber: '',
  email: '',
  className: '2023级',
  guardian1Name: '',
  guardian1Phone: '',
  guardian2Name: '',
  guardian2Phone: '',
  height: null,
  weight: null,
  healthStatus: '',
  sort: null,
  professionalSkills: '',
  majorCourses: '',
  professionalCertificate: '',
  specialty: '',
  rewardsPunishments: '',
  schoolPosition: '',
  skillCompetitionAwards: '',
  schoolAwards: '',
  personalSummary: ''
})

// 民族选项
const nationOptions = [
  '汉族', '壮族', '回族', '满族', '维吾尔族', '苗族', '彝族', '土家族', '藏族', '蒙古族',
  '侗族', '布依族', '瑶族', '白族', '朝鲜族', '哈尼族', '黎族', '哈萨克族', '傣族', '畲族',
  '傈僳族', '东乡族', '高山族', '拉祜族', '水族', '佤族', '纳西族', '羌族', '土族', '仫佬族',
  '锡伯族', '柯尔克孜族', '达斡尔族', '景颇族', '毛南族', '撒拉族', '布朗族', '塔吉克族', '阿昌族', '普米族',
  '鄂温克族', '怒族', '京族', '基诺族', '德昂族', '保安族', '俄罗斯族', '裕固族', '乌孜别克族', '门巴族',
  '鄂伦春族', '独龙族', '塔塔尔族', '赫哲族', '珞巴族'
].map(nation => ({ label: nation, value: nation }))

// 省份选项
const provinceOptions = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东',
  '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏',
  '新疆', '香港', '澳门', '台湾'
].map(province => ({ label: province, value: province }))

// 地区选项
const regionOptions = [
  { label: '华北地区', value: '华北地区' },
  { label: '东北地区', value: '东北地区' },
  { label: '华东地区', value: '华东地区' },
  { label: '华中地区', value: '华中地区' },
  { label: '华南地区', value: '华南地区' },
  { label: '西南地区', value: '西南地区' },
  { label: '西北地区', value: '西北地区' },
  { label: '港澳台地区', value: '港澳台地区' }
]

// 外语种类选项
const languageOptions = [
  { label: '英语', value: '英语' },
  { label: '日语', value: '日语' },
  { label: '韩语', value: '韩语' },
  { label: '法语', value: '法语' },
  { label: '德语', value: '德语' },
  { label: '俄语', value: '俄语' },
  { label: '西班牙语', value: '西班牙语' },
  { label: '葡萄牙语', value: '葡萄牙语' },
  { label: '其他', value: '其他' }
]

// 外语熟练程度选项
const languageLevelOptions = [
  { label: '精通', value: '精通' },
  { label: '熟练', value: '熟练' },
  { label: '一般', value: '一般' },
  { label: '较差', value: '较差' },
  { label: '不懂', value: '不懂' }
]

// 表单字段配置
const formFields = [
  {
    title: '基本信息',
    fields: [
      { prop: 'className', label: '所在班级', type: 'select', span: 24 ,options: []},
      { prop: 'studentName', label: '学生姓名', type: 'input', span: 12 },
      { prop: 'phone', label: '手机号', type: 'input', span: 12 },
      { prop: 'studentId', label: '学号', type: 'input', span: 12 },
      { prop: 'studentCardNo', label: '学籍号', type: 'input', span: 12 },
      { prop: 'idCardType', label: '证件类型', type: 'select', span: 12, options: [
        { label: '身份证', value: '身份证' },
        { label: '护照', value: '护照' },
        { label: '港澳台通行证', value: '港澳台通行证' }
      ]},
      { prop: 'idCard', label: '证件号码', type: 'input', span: 12 },
      { prop: 'gender', label: '性别', type: 'select', span: 12, options: [
        { label: '男', value: '男' },
        { label: '女', value: '女' }
      ]},
      { prop: 'birthday', label: '生日', type: 'date', span: 12 },
      { prop: 'nation', label: '民族', type: 'select', span: 12, options: nationOptions },
      { prop: 'politicalStatus', label: '政治面貌', type: 'select', span: 12, options: [
        { label: '群众', value: '群众' },
        { label: '共青团员', value: '共青团员' },
        { label: '中共党员', value: '中共党员' },
        { label: '中共预备党员', value: '中共预备党员' },
        { label: '民主党派', value: '民主党派' }
      ]},
      { prop: 'enrollmentDate', label: '入学日期', type: 'date', span: 12 },
      { prop: 'graduationDate', label: '毕业日期', type: 'date', span: 12 },
      { prop: 'foreignLanguage', label: '外语种类', type: 'select', span: 12, options: languageOptions },
      { prop: 'foreignLanguageLevel', label: '外语熟练程度', type: 'select', span: 12, options: languageLevelOptions },
      { prop: 'householdLocation', label: '户口所在地', type: 'select', span: 12, options: provinceOptions },
      { prop: 'householdNature', label: '户口性质', type: 'select', span: 12, options: [
        { label: '农业户口', value: '农业户口' },
        { label: '非农业户口', value: '非农业户口' }
      ]},
      { prop: 'nativePlace', label: '籍贯', type: 'select', span: 12, options: provinceOptions },
      { prop: 'familyZipCode', label: '家庭邮编', type: 'input', span: 12 },
      { prop: 'familyAddress', label: '家庭住址', type: 'input', span: 24 },
      { prop: 'location', label: '所在地区', type: 'select', span: 24, options: regionOptions },
      { prop: 'locationAddress', label: '所在地住址', type: 'input', span: 24 },
      { prop: 'qqNumber', label: 'QQ号码', type: 'input', span: 12 },
      { prop: 'email', label: '邮箱', type: 'input', span: 12 },
      { prop: 'className', label: '所在班级', type: 'select', span: 12, options: [
        { label: '2023级', value: '2023级' },
        { label: '2024级', value: '2024级' },
        { label: '2025级', value: '2025级' }
      ]},
      { prop: 'guardian1Name', label: '监护人1姓名', type: 'input', span: 12 },
      { prop: 'guardian1Phone', label: '监护人1电话', type: 'input', span: 12 },
      { prop: 'guardian2Name', label: '监护人2姓名', type: 'input', span: 12 },
      { prop: 'guardian2Phone', label: '监护人2电话', type: 'input', span: 12 },
      { prop: 'height', label: '身高(CM)', type: 'number', span: 12, min: 0, max: 300, precision: 2 },
      { prop: 'weight', label: '体重(KG)', type: 'number', span: 12, min: 0, max: 300, precision: 2 },
      { prop: 'healthStatus', label: '健康状况', type: 'select', span: 12, options: [
        { label: '健康', value: '健康' },
        { label: '良好', value: '良好' },
        { label: '一般', value: '一般' },
        { label: '较差', value: '较差' },
        { label: '有疾病', value: '有疾病' }
      ]},
      { prop: 'sort', label: '排序', type: 'number', span: 12, min: 0 }
    ]
  },
  {
    title: '在校表现',
    fields: [
      { prop: 'professionalSkills', label: '专业技能', type: 'textarea', span: 24, rows: 3 },
      { prop: 'majorCourses', label: '专业主要课程', type: 'textarea', span: 24, rows: 3 },
      { prop: 'professionalCertificate', label: '专业证书', type: 'textarea', span: 24, rows: 3 },
      { prop: 'specialty', label: '特长', type: 'textarea', span: 24, rows: 3 },
      { prop: 'rewardsPunishments', label: '奖励和处分', type: 'textarea', span: 24, rows: 3 },
      { prop: 'schoolPosition', label: '校内职务情况', type: 'textarea', span: 24, rows: 3 },
      { prop: 'skillCompetitionAwards', label: '技能大赛奖项', type: 'textarea', span: 24, rows: 3 },
      { prop: 'schoolAwards', label: '校级奖励', type: 'textarea', span: 24, rows: 3 },
      { prop: 'personalSummary', label: '个人小结', type: 'textarea', span: 24, rows: 5 }
    ]
  }
]

// 模拟数据
const mockData = [
  {
    id: 1,
    studentId: '2021001',
    name: '张三',
    gender: '男',
    phone: '13800138000',
    className: '20艺术1班',
    group: '第一组',
    internshipDirection: '校内实习',
    internshipCompany: '学校后勤部',
    internshipTime: '2025-03-01 至 2025-09-01'
  },
  {
    id: 2,
    studentId: '2021002',
    name: '李小红',
    gender: '女',
    phone: '13800138001',
    className: '20艺术1班',
    group: '第一组',
    internshipDirection: '校外实习',
    internshipCompany: '腾讯科技',
    internshipTime: '2025-03-01 至 2025-09-01'
  },
  {
    id: 3,
    studentId: '2021003',
    name: '王五',
    gender: '男',
    phone: '13800138002',
    className: '20会计2班',
    group: '第二组',
    internshipDirection: '自主实习',
    internshipCompany: '个体经营',
    internshipTime: '2025-04-01 至 2025-10-01'
  }
]

// 搜索字段
const searchFields = [
 {
    prop: 'organization',
    label: '组织架构',
    type: 'organizational',
    span: 4
  },
  {
    prop: 'keyword',
    label: '请输入关键字',
    type: 'input',
    span: 4,
    placeholder: '请输入关键字'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    span: 4,
    placeholder: '请选择状态',
    options: [
      { label: '未就业', value: '未就业' },
      { label: '已就业', value: '已就业' },
      { label: '实习中', value: '实习中' }
    ]
  },
  {
    prop: 'internshipDirection',
    label: '实习去向',
    type: 'select',
    span: 4,
    placeholder: '请选择实习去向',
    options: [
      { label: '校内实习', value: '校内实习' },
      { label: '校外实习', value: '校外实习' },
      { label: '自主实习', value: '自主实习' }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentId', label: '学号', width: 120, align: 'center' },
  { prop: 'name', label: '姓名',  align: 'center', slot: 'name' },
  { prop: 'gender', label: '性别', align: 'center' },
  { prop: 'phone', label: '手机号', width: 130, align: 'center' },
  { prop: 'className', label: '班级', align: 'center' },
  { prop: 'group', label: '小组', align: 'center' },
  { prop: 'internshipDirection', label: '实习去向', width: 120, align: 'center' },
  { prop: 'internshipCompany', label: '实习企业', minWidth: 180, align: 'center' },
  { prop: 'internshipTime', label: '实习时间', minWidth: 200, align: 'center' }
]

// API配置 - 使用模拟数据
const apiConfig = {
  list: (params) => {
    let result = [...mockData]
    // 搜索过滤
    if (params.className) {
      result = result.filter(item => item.className === params.className)
    }
    if (params.keyword) {
      result = result.filter(item =>
        item.studentId.includes(params.keyword) ||
        item.name.includes(params.keyword)
      )
    }
    if (params.status) {
      result = result.filter(item => item.status === params.status)
    }
    if (params.internshipDirection) {
      result = result.filter(item => item.internshipDirection === params.internshipDirection)
    }
    // 分页
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    return {
      code: 200,
      data: {
        list: result.slice(start, end),
        total: result.length
      }
    }
  }
}

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
}

// 刷新
const handleRefresh = () => {
  console.log('刷新列表')
  crudRef.value?.refresh()
}

// 查看详情
const handleView = (row) => {
  Object.assign(formData, {
    studentName: row.name,
    phone: row.phone,
    studentId: row.studentId,
    studentCardNo: '',
    idCardType: '身份证',
    idCard: '',
    gender: row.gender,
    birthday: '',
    nation: '',
    politicalStatus: '',
    enrollmentDate: '',
    graduationDate: '',
    foreignLanguage: '',
    foreignLanguageLevel: '',
    householdLocation: '',
    householdNature: '',
    nativePlace: '',
    familyZipCode: '',
    familyAddress: '',
    location: '',
    locationAddress: '',
    qqNumber: '',
    email: '',
    className: row.className,
    guardian1Name: '',
    guardian1Phone: '',
    guardian2Name: '',
    guardian2Phone: '',
    height: null,
    weight: null,
    healthStatus: '',
    sort: null,
    professionalSkills: '',
    majorCourses: '',
    professionalCertificate: '',
    specialty: '',
    rewardsPunishments: '',
    schoolPosition: '',
    skillCompetitionAwards: '',
    schoolAwards: '',
    personalSummary: ''
  })
  dialogMode.value = 'view'
  detailDialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  Object.assign(formData, row)
  dialogMode.value = 'edit'
  detailDialogVisible.value = true
  nextTick(() => {
    const formEl = dialogRef.value?.formRef
    if (formEl) {
      formEl.clearValidate()
    }
  })
}

// 保存详情
const handleConfirm = () => {
  console.log('保存表单数据:', formData)
  ElMessage.success('保存成功')
  detailDialogVisible.value = false
  crudRef.value?.refresh()
}

// 关闭对话框
const handleDialogClose = () => {
  console.log('对话框关闭')
}

// 添加单个学生
const handleAdd = () => {
  Object.assign(formData, {
    studentName: '',
    phone: '',
    studentId: '',
    studentCardNo: '',
    idCardType: '身份证',
    idCard: '',
    gender: '男',
    birthday: '',
    nation: '',
    politicalStatus: '',
    enrollmentDate: '',
    graduationDate: '',
    foreignLanguage: '',
    foreignLanguageLevel: '',
    householdLocation: '',
    householdNature: '',
    nativePlace: '',
    familyZipCode: '',
    familyAddress: '',
    location: '',
    locationAddress: '',
    qqNumber: '',
    email: '',
    className: '2023级',
    guardian1Name: '',
    guardian1Phone: '',
    guardian2Name: '',
    guardian2Phone: '',
    height: null,
    weight: null,
    healthStatus: '',
    sort: null,
    professionalSkills: '',
    majorCourses: '',
    professionalCertificate: '',
    specialty: '',
    rewardsPunishments: '',
    schoolPosition: '',
    skillCompetitionAwards: '',
    schoolAwards: '',
    personalSummary: ''
  })
  dialogMode.value = 'add'
  detailDialogVisible.value = true
  nextTick(() => {
    const formEl = dialogRef.value?.formRef
    if (formEl) {
      formEl.clearValidate()
    }
  })
}

// 批量选择
const handleImport = () => {
  ElMessage.info('批量选择功能开发中...')
}

// 批量导出实习手册
const handleExportManual = () => {
  ElMessage.info('批量导出实习手册功能开发中...')
}

// 导出实习学生名册
const handleExportRoster = () => {
  ElMessage.info('导出实习学生名册功能开发中...')
}

// 导出实习审批表
const handleExportApproval = () => {
  ElMessage.info('导出实习审批表功能开发中...')
}

// 导出毕业生名册(就业调查)
const handleExportGraduates = () => {
  ElMessage.info('导出毕业生名册(就业调查)功能开发中...')
}

// 毕业生分类表(就业调查)
const handleExportClassification = () => {
  ElMessage.info('毕业生分类表(就业调查)功能开发中...')
}

// 实习管理表导出
const handleExportManagement = () => {
  ElMessage.info('实习管理表导出功能开发中...')
}

// 重置密码
const handleResetPassword = (row) => {
  ElMessage.info('重置密码功能开发中...')
}

// 实习手册
const handleManual = (row) => {
  ElMessage.info('实习手册功能开发中...')
}

// 信息采集
const handleInformationCollection = (row) => {
  infoCollectionVisible.value = true
  activeTab.value = 'collection'
  // 初始化数据
  Object.assign(collectionData, {
    name: row.name,
    studentId: row.studentId,
    phone: row.phone,
    className: row.className,
    photo: '',
    formerName: '',
    idCard: '',
    birthday: '',
    gender: '男',
    nativePlace: '',
    politicalStatus: '群众',
    fatherPhone: '',
    motherPhone: '',
    location: '',
    wechatId: '',
    familyZipCode: '',
    email: '',
    healthStatus: '健康',
    height: null,
    weight: null,
    detailAddress: '',
    school: '',
    schoolCode: '',
    college: '',
    major: '',
    majorCode: '',
    majorDirection: '',
    schoolingSystem: '',
    semester: '',
    enrollmentDate: '',
    graduationDate: '',
    studyForm: '',
    commissionedUnit: '',
    sourcePlace: '',
    majorCourses: '',
    schoolPosition: '',
    rewardsPunishments: '',
    professionalSkills: '',
    professionalCertificate: '',
    skillCompetitionAwards: '',
    foreignLanguage: '英语',
    foreignLanguageLevel: '一般',
    computerLevel: '',
    specialty: '',
    personalSummary: '',
    internshipDirection: '',
    internshipCompany: '',
    companyContact: '',
    companyPhone: '',
    department: '',
    position: '',
    instructor: '',
    instructorPhone: '',
    internshipSalary: '',
    salaryRange: '',
    actualAddress: '',
    arrangementMethod: '',
    majorMatch: '',
    hasAgreement: false,
    hasInsurance: false,
    hasProvidentFund: false,
    internshipStartTime: '',
    actualEndTime: '',
    unitNature: '',
    isMatch: '',
    employmentDepartment: '',
    employmentPosition: '',
    professionalCategory: '',
    enterpriseType: ''
  })
  Object.assign(sourceData, {
    studentName: row.name,
    studentId: row.studentId
  })
  Object.assign(recommendationData, {
    studentName: row.name,
    studentId: row.studentId
  })
  Object.assign(graduationData, {
    studentName: row.name,
    studentId: row.studentId
  })
}

// 信息采集数据
const collectionData = reactive({
  // 基本信息
  photo: '',
  name: '',
  studentId: '',
  formerName: '',
  idCard: '',
  birthday: '',
  gender: '男',
  nativePlace: '',
  politicalStatus: '群众',
  phone: '',
  fatherPhone: '',
  motherPhone: '',
  location: '',
  wechatId: '',
  familyZipCode: '',
  email: '',
  healthStatus: '健康',
  height: null,
  weight: null,
  detailAddress: '',
  // 学籍信息
  school: '',
  schoolCode: '',
  college: '',
  major: '',
  majorCode: '',
  majorDirection: '',
  schoolingSystem: '',
  semester: '',
  className: '',
  enrollmentDate: '',
  graduationDate: '',
  studyForm: '',
  commissionedUnit: '',
  sourcePlace: '',
  // 在校表现
  majorCourses: '',
  schoolPosition: '',
  rewardsPunishments: '',
  professionalSkills: '',
  professionalCertificate: '',
  skillCompetitionAwards: '',
  foreignLanguage: '英语',
  foreignLanguageLevel: '一般',
  computerLevel: '',
  specialty: '',
  personalSummary: '',
  // 实习信息
  internshipDirection: '',
  internshipCompany: '',
  companyContact: '',
  companyPhone: '',
  department: '',
  position: '',
  instructor: '',
  instructorPhone: '',
  internshipSalary: '',
  salaryRange: '',
  actualAddress: '',
  arrangementMethod: '',
  majorMatch: '',
  hasAgreement: false,
  hasInsurance: false,
  hasProvidentFund: false,
  internshipStartTime: '',
  actualEndTime: '',
  // 就业名册
  unitNature: '',
  isMatch: '',
  employmentDepartment: '',
  employmentPosition: '',
  professionalCategory: '',
  enterpriseType: ''
})

const collectionFields = [
  {
    title: '基本信息',
    fields: [
      { prop: 'photo', label: '一寸照片', type: 'upload', span: 12 },
      { prop: 'name', label: '姓名', type: 'input', span: 12 },
      { prop: 'studentId', label: '学号', type: 'input', span: 12 },
      { prop: 'formerName', label: '曾用名', type: 'input', span: 12 },
      { prop: 'idCard', label: '身份证号', type: 'input', span: 12 },
      { prop: 'birthday', label: '出生年月', type: 'date', span: 12 },
      { prop: 'gender', label: '性别', type: 'select', span: 12, options: [
        { label: '男', value: '男' },
        { label: '女', value: '女' }
      ]},
      { prop: 'nativePlace', label: '籍贯', type: 'select', span: 12, options: provinceOptions },
      { prop: 'politicalStatus', label: '政治面貌', type: 'select', span: 12, options: [
        { label: '群众', value: '群众' },
        { label: '共青团员', value: '共青团员' },
        { label: '中共党员', value: '中共党员' },
        { label: '中共预备党员', value: '中共预备党员' },
        { label: '民主党派', value: '民主党派' }
      ]},
      { prop: 'phone', label: '手机号码', type: 'input', span: 12 },
      { prop: 'fatherPhone', label: '父亲电话', type: 'input', span: 12 },
      { prop: 'motherPhone', label: '母亲电话', type: 'input', span: 12 },
      { prop: 'location', label: '所在地区', type: 'select', span: 12, options: regionOptions },
      { prop: 'wechatId', label: '微信号', type: 'input', span: 12 },
      { prop: 'familyZipCode', label: '家庭邮编', type: 'input', span: 12 },
      { prop: 'email', label: '电子邮箱', type: 'input', span: 12 },
      { prop: 'healthStatus', label: '健康状况', type: 'select', span: 12, options: [
        { label: '健康', value: '健康' },
        { label: '良好', value: '良好' },
        { label: '一般', value: '一般' },
        { label: '较差', value: '较差' },
        { label: '有疾病', value: '有疾病' }
      ]},
      { prop: 'height', label: '身高(CM)', type: 'number', span: 12, min: 0, max: 300, precision: 2 },
      { prop: 'weight', label: '体重(KG)', type: 'number', span: 12, min: 0, max: 300, precision: 2 },
      { prop: 'detailAddress', label: '详细地址', type: 'textarea', span: 24, rows: 2 }
    ]
  },
  {
    title: '学籍信息',
    fields: [
      { prop: 'school', label: '所属学校', type: 'input', span: 12 },
      { prop: 'schoolCode', label: '学校代码', type: 'input', span: 12 },
      { prop: 'college', label: '所属学院', type: 'input', span: 12 },
      { prop: 'major', label: '学校专业', type: 'input', span: 12 },
      { prop: 'majorCode', label: '专业代码', type: 'input', span: 12 },
      { prop: 'majorDirection', label: '专业方向', type: 'input', span: 12 },
      { prop: 'schoolingSystem', label: '学制', type: 'input', span: 12 },
      { prop: 'semester', label: '学期', type: 'input', span: 12 },
      { prop: 'className', label: '所在班级', type: 'input', span: 12 },
      { prop: 'enrollmentDate', label: '入学时间', type: 'date', span: 12 },
      { prop: 'graduationDate', label: '毕业时间', type: 'date', span: 12 },
      { prop: 'studyForm', label: '学习形式', type: 'select', span: 12, options: [
        { label: '全日制', value: '全日制' },
        { label: '业余', value: '业余' },
        { label: '函授', value: '函授' },
        { label: '网络教育', value: '网络教育' }
      ]},
      { prop: 'commissionedUnit', label: '委培单位', type: 'input', span: 12 },
      { prop: 'sourcePlace', label: '生源地', type: 'select', span: 12, options: provinceOptions }
    ]
  },
  {
    title: '在校表现',
    fields: [
      { prop: 'majorCourses', label: '专业主要课程', type: 'textarea', span: 24, rows: 3 },
      { prop: 'schoolPosition', label: '担任班干部情况', type: 'textarea', span: 24, rows: 3 },
      { prop: 'rewardsPunishments', label: '奖罚情况', type: 'textarea', span: 24, rows: 3 },
      { prop: 'professionalSkills', label: '专业技能', type: 'textarea', span: 24, rows: 3 },
      { prop: 'professionalCertificate', label: '专业证书', type: 'textarea', span: 24, rows: 3 },
      { prop: 'skillCompetitionAwards', label: '技能大赛最高奖项', type: 'textarea', span: 24, rows: 3 },
      { prop: 'foreignLanguage', label: '外语种类', type: 'select', span: 12, options: languageOptions },
      { prop: 'foreignLanguageLevel', label: '熟练度', type: 'select', span: 12, options: languageLevelOptions },
      { prop: 'computerLevel', label: '计算机水平', type: 'select', span: 12, options: [
        { label: '计算机一级', value: '计算机一级' },
        { label: '计算机二级', value: '计算机二级' },
        { label: '计算机三级', value: '计算机三级' },
        { label: '计算机四级', value: '计算机四级' },
        { label: '无', value: '无' }
      ]},
      { prop: 'specialty', label: '特长爱好', type: 'textarea', span: 12, rows: 3 },
      { prop: 'personalSummary', label: '个人小结', type: 'textarea', span: 24, rows: 5 }
    ]
  },
  {
    title: '实习信息',
    fields: [
      { prop: 'internshipDirection', label: '实习去向', type: 'select', span: 12, options: [
        { label: '校内实习', value: '校内实习' },
        { label: '校外实习', value: '校外实习' },
        { label: '自主实习', value: '自主实习' }
      ]},
      { prop: 'internshipCompany', label: '实习企业', type: 'input', span: 12 },
      { prop: 'companyContact', label: '企业联系人', type: 'input', span: 12 },
      { prop: 'companyPhone', label: '联系电话', type: 'input', span: 12 },
      { prop: 'department', label: '部门', type: 'input', span: 12 },
      { prop: 'position', label: '岗位', type: 'input', span: 12 },
      { prop: 'instructor', label: '指导老师', type: 'input', span: 12 },
      { prop: 'instructorPhone', label: '指导老师电话', type: 'input', span: 12 },
      { prop: 'internshipSalary', label: '实习薪资', type: 'input', span: 12 },
      { prop: 'salaryRange', label: '薪资范围', type: 'input', span: 12 },
      { prop: 'actualAddress', label: '实际上班地址', type: 'textarea', span: 24, rows: 2 },
      { prop: 'arrangementMethod', label: '安排方式', type: 'select', span: 12, options: [
        { label: '学校安排', value: '学校安排' },
        { label: '自主安排', value: '自主安排' },
        { label: '推荐', value: '推荐' }
      ]},
      { prop: 'majorMatch', label: '专业对口情况', type: 'select', span: 12, options: [
        { label: '完全对口', value: '完全对口' },
        { label: '部分对口', value: '部分对口' },
        { label: '不对口', value: '不对口' }
      ]},
      { prop: 'hasAgreement', label: '有无实习协议', type: 'select', span: 12, options: [
        { label: '有', value: true },
        { label: '无', value: false }
      ]},
      { prop: 'hasInsurance', label: '是否购买保险', type: 'select', span: 12, options: [
        { label: '是', value: true },
        { label: '否', value: false }
      ]},
      { prop: 'hasProvidentFund', label: '有无公积金', type: 'select', span: 12, options: [
        { label: '有', value: true },
        { label: '无', value: false }
      ]},
      { prop: 'internshipStartTime', label: '实习开始时间', type: 'date', span: 12 },
      { prop: 'actualEndTime', label: '实际结束时间', type: 'date', span: 12 }
    ]
  },
  {
    title: '就业名册',
    fields: [
      { prop: 'unitNature', label: '单位性质', type: 'select', span: 12, options: [
        { label: '国有企业', value: '国有企业' },
        { label: '民营企业', value: '民营企业' },
        { label: '外资企业', value: '外资企业' },
        { label: '合资企业', value: '合资企业' },
        { label: '事业单位', value: '事业单位' },
        { label: '政府机关', value: '政府机关' },
        { label: '自主创业', value: '自主创业' },
        { label: '其他', value: '其他' }
      ]},
      { prop: 'isMatch', label: '是否对口', type: 'select', span: 12, options: [
        { label: '是', value: '是' },
        { label: '否', value: '否' }
      ]},
      { prop: 'employmentDepartment', label: '部门', type: 'input', span: 12 },
      { prop: 'employmentPosition', label: '岗位', type: 'input', span: 12 },
      { prop: 'professionalCategory', label: '专业类别', type: 'input', span: 12 },
      { prop: 'enterpriseType', label: '企业类型', type: 'select', span: 12, options: [
        { label: '大型企业', value: '大型企业' },
        { label: '中型企业', value: '中型企业' },
        { label: '小型企业', value: '小型企业' },
        { label: '微型企业', value: '微型企业' },
        { label: '其他', value: '其他' }
      ]}
    ]
  }
]

const collectionRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthday: [{ required: true, message: '请选择出生年月', trigger: 'change' }],
  school: [{ required: true, message: '请输入所属学校', trigger: 'blur' }],
  major: [{ required: true, message: '请输入学校专业', trigger: 'blur' }],
  className: [{ required: true, message: '请输入所在班级', trigger: 'blur' }]
}

// 生源信息数据
const sourceData = reactive({
  studentName: '',
  studentId: '',
  province: '北京',
  city: '北京',
  county: '',
  school: '',
  graduationTime: '',
  score: null,
  major: ''
})

const sourceFields = [
  {
    fields: [
      { prop: 'studentName', label: '姓名', type: 'input', span: 12 },
      { prop: 'studentId', label: '学号', type: 'input', span: 12 },
      { prop: 'province', label: '省份', type: 'select', span: 8, options: provinceOptions },
      { prop: 'city', label: '城市', type: 'input', span: 8 },
      { prop: 'county', label: '区县', type: 'input', span: 8 },
      { prop: 'school', label: '毕业学校', type: 'input', span: 12 },
      { prop: 'graduationTime', label: '毕业时间', type: 'date', span: 12 },
      { prop: 'score', label: '高考分数', type: 'number', span: 12, min: 0, max: 750 },
      { prop: 'major', label: '报考专业', type: 'input', span: 12 }
    ]
  }
]

const sourceRules = {}

// 就业推荐数据
const recommendationData = reactive({
  studentName: '',
  studentId: '',
  internshipCompany: '',
  internshipPosition: '',
  internshipTime: '',
  internshipEvaluation: '',
  employmentDirection: '',
  employmentCity: '',
  expectedSalary: '',
  selfEvaluation: ''
})

const recommendationFields = [
  {
    fields: [
      { prop: 'studentName', label: '姓名', type: 'input', span: 12 },
      { prop: 'studentId', label: '学号', type: 'input', span: 12 },
      { prop: 'internshipCompany', label: '实习单位', type: 'input', span: 12 },
      { prop: 'internshipPosition', label: '实习岗位', type: 'input', span: 12 },
      { prop: 'internshipTime', label: '实习时间', type: 'input', span: 12 },
      { prop: 'internshipEvaluation', label: '实习评价', type: 'textarea', span: 12, rows: 3 },
      { prop: 'employmentDirection', label: '就业方向', type: 'select', span: 12, options: [
        { label: '技术岗', value: '技术岗' },
        { label: '管理岗', value: '管理岗' },
        { label: '销售岗', value: '销售岗' },
        { label: '其他', value: '其他' }
      ]},
      { prop: 'employmentCity', label: '期望就业城市', type: 'input', span: 12 },
      { prop: 'expectedSalary', label: '期望薪资', type: 'input', span: 12 },
      { prop: 'selfEvaluation', label: '自我评价', type: 'textarea', span: 24, rows: 4 }
    ]
  }
]

const recommendationRules = {}

// 毕业去向数据
const graduationData = reactive({
  studentName: '',
  studentId: '',
  graduationStatus: '就业',
  company: '',
  position: '',
  city: '',
  salary: '',
  furtherStudySchool: '',
  furtherStudyMajor: '',
  employmentDate: '',
  contact: '',
  remark: ''
})

const graduationFields = [
  {
    fields: [
      { prop: 'studentName', label: '姓名', type: 'input', span: 12 },
      { prop: 'studentId', label: '学号', type: 'input', span: 12 },
      { prop: 'graduationStatus', label: '毕业去向', type: 'select', span: 12, options: [
        { label: '就业', value: '就业' },
        { label: '升学', value: '升学' },
        { label: '创业', value: '创业' },
        { label: '出国', value: '出国' },
        { label: '待业', value: '待业' }
      ]},
      { prop: 'employmentDate', label: '就业时间', type: 'date', span: 12 },
      { prop: 'company', label: '就业单位', type: 'input', span: 12 },
      { prop: 'position', label: '岗位', type: 'input', span: 12 },
      { prop: 'city', label: '就业城市', type: 'input', span: 12 },
      { prop: 'salary', label: '薪资', type: 'input', span: 12 },
      { prop: 'furtherStudySchool', label: '升学学校', type: 'input', span: 12 },
      { prop: 'furtherStudyMajor', label: '升学专业', type: 'input', span: 12 },
      { prop: 'contact', label: '联系方式', type: 'input', span: 12 },
      { prop: 'remark', label: '备注', type: 'textarea', span: 24, rows: 3 }
    ]
  }
]

const graduationRules = {}

// 保存信息采集
const handleSaveCollection = () => {
  ElMessage.success('信息采集保存成功')
  infoCollectionVisible.value = false
}

</script>

<style scoped>
/* 姓名链接样式 */
.name-link {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: #409eff;
  transition: color 0.3s;
}

.name-link:hover {
  color: #66b1ff;
}

.link-icon {
  margin-right: 4px;
  font-size: 16px;
}

.name-text {
  font-weight: 500;
}
</style>
