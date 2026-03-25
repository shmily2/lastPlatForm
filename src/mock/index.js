// 模拟数据
const users = [
  { id: 1, username: 'admin', password: '123456', name: '管理员', avatar: '', roles: ['admin'], permissions: ['*:*:*'] },
  { id: 2, username: 'user', password: '123456', name: '普通用户', avatar: '', roles: ['user'], permissions: ['system:user:view', 'system:user:add', 'system:user:edit'] }
]

// 模拟菜单数据
const menus = [
  {
    id: 1,
    title: '实习申请',
    icon: 'Edit',
    path: '/internship',
    hidden: false,
    permissions: ['internship:*:*'],
    children: [
      {
        id: 11,
        title: '实习审批',
        icon: 'List',
        path: '/internship/list',
        component: 'internship/list/index',
        hidden: false,
        permissions: ['internship:list:view']
      }
    ]
  },
  {
    id: 2,
    title: '实习分配',
    icon: 'Share',
    path: '/assignment',
    hidden: false,
    permissions: ['assignment:*:*'],
    children: [
      {
        id: 21,
        title: '实习批次',
        icon: 'Management',
        path: '/assignment/manage',
        component: 'assignment/manage/index',
        hidden: false,
        permissions: ['assignment:manage:view']
      },
      {
        id: 22,
        title: '实习记录',
        icon: 'Notebook',
        path: '/assignment/record',
        component: 'assignment/record/index',
        hidden: false,
        permissions: ['assignment:record:view']
      }
    ]
  },
  {
    id: 3,
    title: '学生请假',
    icon: 'Calendar',
    path: '/leave',
    hidden: false,
    permissions: ['leave:*:*'],
    children: [
      {
        id: 31,
        title: '实习请假',
        icon: 'EditPen',
        path: '/leave/apply',
        component: 'leave/apply/index',
        hidden: false,
        permissions: ['leave:apply:view']
      }
    ]
  },
  {
    id: 4,
    title: '打卡管理',
    icon: 'Clock',
    path: '/attendance',
    hidden: false,
    permissions: ['attendance:*:*'],
    children: [
      {
        id: 41,
        title: '打卡详情',
        icon: 'List',
        path: '/attendance/record',
        component: 'attendance/record/index',
        hidden: false,
        permissions: ['attendance:record:view']
      },
      {
        id: 42,
        title: '打卡统计',
        icon: 'TrendCharts',
        path: '/attendance/statistics',
        component: 'attendance/statistics/index',
        hidden: false,
        permissions: ['attendance:statistics:view']
      },
      {
        id: 43,
        title: '打卡排名',
        icon: 'TrendCharts',
        path: '/attendance/ranking',
        component: 'attendance/ranking/index',
        hidden: false,
        permissions: ['attendance:ranking:view']
      }
    ]
  },
  {
    id: 5,
    title: '实习报告',
    icon: 'Document',
    path: '/report',
    hidden: false,
    permissions: ['report:*:*'],
    children: [
      {
        id: 51,
        title: '周报',
        icon: 'Upload',
        path: '/report/submit',
        component: 'report/submit/index',
        hidden: false,
        permissions: ['report:submit:view']
      },
      {
        id: 52,
        title: '月报',
        icon: 'DocumentChecked',
        path: '/report/monthly',
        component: 'report/monthly/index',
        hidden: false,
        permissions: ['report:monthly:view']
      },
      {
        id: 53,
        title: '周月报表单配置',
        icon: 'DocumentChecked',
        path: '/report/form-configuration',
        component: 'report/form-configuration/index',
        hidden: false,
        permissions: ['report:review:view']
      }
    ]
  },
  {
    id: 6,
    title: '巡访记录',
    icon: 'Van',
    path: '/visit',
    hidden: false,
    permissions: ['visit:*:*'],
    children: [
      {
        id: 61,
        title: '巡访列表',
        icon: 'Calendar',
        path: '/visit/plan',
        component: 'visit/plan/index',
        hidden: false,
        permissions: ['visit:plan:view']
      },
      // {
      //   id: 62,
      //   title: '领导巡访',
      //   icon: 'Notebook',
      //   path: '/visit/leader',
      //   component: 'visit/record/index',
      //   hidden: false,
      //   permissions: ['visit:leader:view']
      // },
      {
        id: 63,
        title: '巡访审批',
        icon: 'DocumentChecked',
        path: '/visit/approval',
        component: 'visit/approval/index',
        hidden: false,
        permissions: ['visit:approval:view']
      },
      {
        id: 64,
        title: '审批详情',
        lightPaht:"/visit/approval",
        path: '/visit/approval/detail/:id?',
        component: 'visit/approval/detail',
        hidden: true,
        permissions: ['visit:approval:view']
      }
    ]
  },
  {
    id: 7,
    title: '数据分析',
    icon: 'DataAnalysis',
    path: '/analysis',
    hidden: false,
    permissions: ['analysis:*:*'],
    children: [
      {
        id: 71,
        title: '数据分析',
        icon: 'TrendCharts',
        path: '/analysis/internship',
        component: 'analysis/internship/index',
        hidden: false,
        permissions: ['analysis:internship:view']
      },
      {
        id: 72,
        title: '绩效考核',
        icon: 'DataLine',
        path: '/analysis/student',
        component: 'analysis/student/index',
        hidden: false,
        permissions: ['analysis:student:view']
      },
      {
        id: 73,
        title: '学生考核',
        icon: 'DataBoard',
        path: '/analysis/company',
        component: 'analysis/company/index',
        hidden: false,
        permissions: ['analysis:company:view']
      },
      {
        id: 74,
        title: '毕业学生考核',
        icon: 'DataBoard',
        path: '/analysis/graduate',
        component: 'analysis/graduate/index',
        hidden: false,
        permissions: ['analysis:graduate:view']
      }
    ]
  },
  {
    id: 8,
    title: '人员信息',
    icon: 'User',
    path: '/personnel',
    hidden: false,
    permissions: ['personnel:*:*'],
    children: [
      {
        id: 81,
        title: '教师管理',
        icon: 'User',
        path: '/personnel/student',
        component: 'personnel/student/index',
        hidden: false,
        permissions: ['personnel:student:view']
      },
      {
        id: 82,
        title: '教师信息',
        icon: 'UserFilled',
        path: '/personnel/teacher',
        component: 'personnel/teacher/index',
        hidden: false,
        permissions: ['personnel:teacher:view']
      },
      {
        id: 83,
        title: '班级学生',
        icon: 'OfficeBuilding',
        path: '/personnel/class',
        component: 'personnel/class/index',
        hidden: false,
        permissions: ['personnel:class:view']
      },
      {
        id: 84,
        title: '信息采集',
        icon: 'OfficeBuilding',
        path: '/personnel/informationCollection',
        component: 'personnel/informationCollection/index',
        hidden: false,
        permissions: ['personnel:class:view']
      },
    ]
  },
  {
    id: 9,
    title: '实习记录',
    icon: 'Notebook',
    path: '/record',
    hidden: false,
    permissions: ['record:*:*'],
    children: [
      {
        id: 91,
        title: '实习计划',
        icon: 'Document',
        path: '/record/plan',
        component: 'record/plan/index',
        hidden: false,
        permissions: ['record:plan:view']
      },
      {
        id: 92,
        title: '返校记录',
        icon: 'Files',
        path: '/record/backtoschool',

        component: 'record/backtoschool/index',
        hidden: false,
        permissions: ['record:summary:view']
      },
      {
        id: 93,
        title: '学生联系情况',
        icon: 'Files',
        path: '/record/StudentInformation',
        component: 'record/StudentInformation/index',
        hidden: false,
        permissions: ['record:interview:view']
      },
      {
        id: 94,
        title: '优秀实习生事迹',
        icon: 'Files',
        path: '/record/excellent',
        component: 'record/excellent/index',
        hidden: false,
        permissions: ['record:excellent:view']
      },
      {
        id: 95,
        title: '实习管理典型案例',
        icon: 'Files',
        path: '/record/case',
        component: 'record/case/index',
        hidden: false,
        permissions: ['record:case:view']
      },
        {
        id: 97,
        title: '违规处理',
        icon: 'Files',
        path: '/record/violation',
        component: 'record/violation/index',
        hidden: false,
        permissions: ['record:violation:view']
      },
      {
        id: 96,
        title: '单位考评意见',
        icon: 'Files',
        path: '/record/evaluation',
        component: 'record/evaluation/index',
        hidden: false,
        permissions: ['record:evaluation:view']
      },
          {
        id: 98,
        title: '实习总结',
        icon: 'Files',
        path: '/record/internship-summary',
        component: 'record/internship-summary/index',
        hidden: false,
        permissions: ['record:internship-summary:view']
      },
    ]
  },
  {
    id: 10,
    title: '问卷调查',
    icon: 'Memo',
    path: '/summary',
    hidden: false,
    permissions: ['summary:*:*'],
    children: [
      {
        id: 101,
        title: '问卷计划',
        icon: 'Edit',
        path: '/summary/fill',
        component: 'summary/fill/index',
        hidden: false,
        permissions: ['summary:fill:view']
      },
        {
        id: 102,
        title: '问卷模板',
        icon: 'Document',
        path: '/questionnaire/template',
        component: 'questionnaire/template/index',
        hidden: false,
        permissions: ['summary:template:view']
      },
      {
        id: 103,
        title: '编辑问卷模板',
        icon: 'Edit',
        path: '/questionnaire/template/edit',
        component: 'questionnaire/template/edit',
        hidden: true,
        permissions: ['summary:template:edit']
      },
    ]
  },
  {
    id: 11,
    title: '图文内容',
    icon: 'Picture',
    path: '/content',
    hidden: false,
    permissions: ['content:*:*'],
    children: [
      {
        id: 111,
        title: '通知公告',
        icon: 'Management',
        path: '/content/notice',
        component: 'content/notice/index',
        hidden: false,
        permissions: ['content:notice:view']
      },
        {
        id: 112,
        title: 'APP轮播图',
        icon: 'Management',
        path: '/content/carousel',
        component: 'content/carousel/index',
        hidden: false,
        permissions: ['content:carousel:view']
      },
      {
        id: 113,
        title: '新手指导',
        icon: 'Management',
        path: '/content/guide',
        component: 'content/guide/index',
        hidden: false,
        permissions: ['content:guide:view']
      },
    ]
  },
  {
    id: 12,
    title: '文件管理',
    icon: 'Folder',
    path: '/file',
    hidden: false,
    permissions: ['file:*:*'],
    children: [
      {
        id: 121,
        title: '文件管理',
        icon: 'List',
        path: '/file/list',
        component: 'file/list/index',
        hidden: false,
        permissions: ['file:list:view']
      }
    ]
  },
  {
    id: 13,
    title: '常用表格下载',
    icon: 'Download',
    path: '/download',
    hidden: false,
    permissions: ['download:*:*'],
    children: [
      {
        id: 131,
        title: '表格下载',
        icon: 'List',
        path: '/download',
        component: 'download/index',
        hidden: false,
        permissions: ['download:list:view']
      }
    ]
  },
   {
    id: 16,
    title: '抽查管理',
    icon: 'spotCheck',
    path: '/spotCheck',
    hidden: false,
    permissions: ['spotCheck:*:*'],
    children: [
          {
        id: 161,
        title: '抽查记录',
        icon: 'Check',
        path: '/spotCheck/record',
        component: 'spotCheck/record/index',
        hidden: false,
        permissions: ['spotCheck:record:view']
      },
    ]
  },
  {
    id: 14,
    title: '企业信息',
    icon: 'FirstAidKit',
    path: '/hospital',
    hidden: false,
    permissions: ['hospital:*:*'],
    children: [
      {
        id: 141,
        title: '实习企业',
        icon: 'List',
        path: '/hospital/list',
        component: 'hospital/list/index',
        hidden: false,
        permissions: ['hospital:list:view']
      }
    ]
  },
   {
    id: 15,
    title: '基础设置',
    icon: 'Setting',
    path: '/setting',
    hidden: false,
    permissions: ['setting:*:*'],
    children: [
      {
        id: 151,
        title: '组织架构',
        icon: 'List',
        path: '/setting/org',
        component: 'setting/org/index',
        hidden: false,
        permissions: ['hospital:list:view']
      },
       {
        id: 152,
        title: '信息采集',
        icon: 'List',
        path: '/setting/info',
        component: 'setting/info/index',
        hidden: false,
        permissions: ['setting:info:view']
      },
        {
        id: 153,
        title: '菜单管理',
        icon: 'List',
        path: '/setting/menu',
        component: 'setting/menu/index',
        hidden: false,
        permissions: ['setting:menu:view']
      },
          {
        id: 154,
        title: '角色管理',
        icon: 'List',
        path: '/setting/role',
        component: 'setting/role/index',
        hidden: false,
        permissions: ['setting:role:view']
      },
    ]
  }
]

// 组织架构树形数据（系部 -> 年级 -> 班级）
const orgTree = [
  { id: '艺术系', value: '艺术系', label: '艺术系', children: [
    { id: '2020级', value: '2020级', label: '2020级', children: [
      { id: '20艺术1班', value: '20艺术1班', label: '20艺术1班' },
      { id: '20艺术2班', value: '20艺术2班', label: '20艺术2班' }
    ]},
    { id: '2021级', value: '2021级', label: '2021级', children: [
      { id: '21艺术1班', value: '21艺术1班', label: '21艺术1班' }
    ]}
  ]},
  { id: '服务系', value: '服务系', label: '服务系', children: [
    { id: '2020级', value: '2020级', label: '2020级', children: [
      { id: '20旅游1班', value: '20旅游1班', label: '20旅游1班' },
      { id: '20酒店1班', value: '20酒店1班', label: '20酒店1班' }
    ]}
  ]},
  { id: '工程系', value: '工程系', label: '工程系', children: [
    { id: '2020级', value: '2020级', label: '2020级', children: [
      { id: '20机电1班', value: '20机电1班', label: '20机电1班' },
      { id: '20汽修1班', value: '20汽修1班', label: '20汽修1班' }
    ]}
  ]},
  { id: '护理系', value: '护理系', label: '护理系', children: [
    { id: '2020级', value: '2020级', label: '2020级', children: [
      { id: '20护理1班', value: '20护理1班', label: '20护理1班' },
      { id: '20护理2班', value: '20护理2班', label: '20护理2班' }
    ]},
    { id: '2021级', value: '2021级', label: '2021级', children: [
      { id: '21护理1班', value: '21护理1班', label: '21护理1班' }
    ]}
  ]},
  { id: '临床系', value: '临床系', label: '临床系', children: [
    { id: '2020级', value: '2020级', label: '2020级', children: [
      { id: '20临床1班', value: '20临床1班', label: '20临床1班' }
    ]}
  ]},
  { id: '康复系', value: '康复系', label: '康复系', children: [
    { id: '2020级', value: '2020级', label: '2020级', children: [
      { id: '20康复1班', value: '20康复1班', label: '20康复1班' }
    ]}
  ]}
]

// 获取组织架构接口
export function getOrgTree() {
  return {
    code: 200,
    message: 'success',
    data: orgTree
  }
}

// 导出数据
export { users, menus }

// Mock拦截器设置
export function setupMock(app) {
  if (import.meta.env.DEV) {
    app.config.globalProperties.$mock = { users, menus, orgTree }
  }
}
