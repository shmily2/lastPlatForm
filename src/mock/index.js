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
      // {
      //   id: 53,
      //   title: '科室实习手册',
      //   icon: 'DocumentChecked',
      //   path: '/report/review',
      //   component: 'report/review/index',
      //   hidden: false,
      //   permissions: ['report:review:view']
      // }
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
      {
        id: 62,
        title: '领导巡访',
        icon: 'Notebook',
        path: '/visit/leader',
        component: 'visit/record/index',
        hidden: false,
        permissions: ['visit:leader:view']
      },
      {
        id: 63,
        title: '巡访审批',
        icon: 'DocumentChecked',
        path: '/visit/approval',
        component: 'visit/record/index',
        hidden: false,
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
      }
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
        title: '实习总结',
        icon: 'Files',
        path: '/record/summary',
        component: 'record/summary/index',
        hidden: false,
        permissions: ['record:summary:view']
      },
      {
        id: 93,
        title: '学生访谈记录',
        icon: 'Files',
        path: '/record/interview',
        component: 'record/interview/index',
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
        id: 96,
        title: '单位考评意见',
        icon: 'Files',
        path: '/record/evaluation',
        component: 'record/evaluation/index',
        hidden: false,
        permissions: ['record:evaluation:view']
      }
    ]
  },
  {
    id: 10,
    title: '院系实习总结',
    icon: 'Memo',
    path: '/summary',
    hidden: false,
    permissions: ['summary:*:*'],
    children: [
      {
        id: 101,
        title: '院系实习总结',
        icon: 'Edit',
        path: '/summary/fill',
        component: 'summary/fill/index',
        hidden: false,
        permissions: ['summary:fill:view']
      }
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
      }
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
        path: '/download/list',
        component: 'download/list/index',
        hidden: false,
        permissions: ['download:list:view']
      }
    ]
  },
  {
    id: 14,
    title: '医院信息管理',
    icon: 'FirstAidKit',
    path: '/hospital',
    hidden: false,
    permissions: ['hospital:*:*'],
    children: [
      {
        id: 141,
        title: '实习医院',
        icon: 'List',
        path: '/hospital/list',
        component: 'hospital/list/index',
        hidden: false,
        permissions: ['hospital:list:view']
      }
    ]
  }
]

// 导出菜单数据和用户数据供其他模块使用
export { users, menus }

// Mock拦截器设置
export function setupMock(app) {
  // 在Vite中使用mockjs进行拦截
  if (import.meta.env.DEV) {
    app.config.globalProperties.$mock = {
      users,
      menus
    }
  }
}
