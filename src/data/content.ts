export type Category = "youth" | "adult" | "career" | "camp";
export type Grade = "all" | "primary-low" | "primary-high" | "middle" | "high";

export type Course = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  description: string;
  audience: string;
  duration: string;
  outcomes: string[];
  stages: { title: string; description: string }[];
  tags: string[];
  status?: string;
  grades?: Grade[];
  note?: string;
};

export type Product = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url?: string;
  tags: string[];
  status: string;
};

export const contact = {
  name: "常老师",
  phone: "17821821196",
  company: "上海长序逢晴智能科技有限公司",
  brand: "长晴AI",
};

export const categories: {
  id: Category;
  name: string;
  label: string;
  description: string;
}[] = [
  {
    id: "youth",
    name: "青少年科技素养",
    label: "YOUNG CREATORS",
    description:
      "六个创作主题，贯穿小学到高中。同题分层、异龄协作，让每个孩子留下自己的思考与作品。",
  },
  {
    id: "adult",
    name: "成人与企业培训",
    label: "AI AT WORK",
    description:
      "从认识 AI 到完成真实任务。面向个人、新员工与不同岗位，把方法变成可以带回工作的成果。",
  },
  {
    id: "career",
    name: "职业培训项目",
    label: "PROFESSIONAL SKILLS",
    description:
      "围绕数据、训练与模型应用搭建职业能力路径。三个项目处于拟申报阶段，开班与认定安排以当期公告为准。",
  },
  {
    id: "camp",
    name: "AI 机器人研学",
    label: "LEARN IN THE WORLD",
    description:
      "走进机器人与智能制造的现场，在参观、体验和工程挑战中，把好奇心变成一次亲手完成的探索。",
  },
];

export const grades: { id: Grade; name: string }[] = [
  { id: "all", name: "全部学段" },
  { id: "primary-low", name: "小学 1—3 年级" },
  { id: "primary-high", name: "小学 4—6 年级" },
  { id: "middle", name: "初中" },
  { id: "high", name: "高中" },
];

const youthGrades: Grade[] = ["primary-low", "primary-high", "middle", "high"];
const youthNote =
  "按小学 1—3 年级、小学 4—6 年级、初中和高中分学段实施，同一主题设置基础、标准、挑战三级任务。低学段重体验与表达，高学段逐步加强独立设计、测试与论证；每人保留自己的成长记录。科技素养课程不对应职业技能等级证书。";
const careerNote =
  "拟申报项目，当前不代表已获批或已备案。招生条件、开班及职业能力认定安排以当期正式公告为准，不承诺取证或补贴。";

// Editorial source: the 66 curriculum documents audited in September 2026.
// Outcomes below describe teaching targets, not claims of completed student results.
export const courses: Course[] = [
  {
    id: "youth-film",
    category: "youth",
    title: "AI 微电影创作",
    subtitle: "把一个想法，拍成自己的故事。",
    description:
      "以视觉叙事为线索，学习从主题、脚本、画面到成片的创作方法。在角色与镜头中练习表达，也学会尊重事实、肖像与版权。",
    audience: "小学至高中 · 分学段教学",
    duration: "全年 30 节 × 45 分钟",
    outcomes: ["一部主题短片", "脚本与分镜创作记录", "年度展映与作品说明"],
    stages: [
      {
        title: "通识与安全",
        description:
          "观察镜头如何讲故事，认识 AI 生成内容的特点，建立肖像、版权与负责任表达的规则。",
      },
      {
        title: "技能建构",
        description:
          "确定主题，整理脚本与分镜，在分层任务中完成主题短片的基础原型。",
      },
      {
        title: "项目深化",
        description:
          "围绕叙事是否清晰开展试看，记录反馈，调整画面、节奏与声音。",
      },
      {
        title: "成果展示",
        description:
          "完成终稿和素材说明，以作品介绍、答辩或研究表达参与年度展映。",
      },
    ],
    tags: ["视觉叙事", "创意表达", "年度展映"],
    grades: [...youthGrades],
    note: youthNote,
  },
  {
    id: "youth-modeling",
    category: "youth",
    title: "AI 三维建模",
    subtitle: "让想象拥有形状与空间。",
    description:
      "从观察真实物体出发，认识形体、比例与空间关系。借助 AI 与数字建模工具，将设计想法转化为能展示、能解释的三维作品。",
    audience: "小学至高中 · 分学段教学",
    duration: "全年 30 节 × 45 分钟",
    outcomes: ["一个三维设计作品", "模型测试与修改记录", "年度 3D 设计展说明"],
    stages: [
      {
        title: "通识与安全",
        description:
          "观察物体的形体与空间，认识数字模型的用途和边界，学习素材使用规则。",
      },
      {
        title: "技能建构",
        description:
          "通过基础造型与组合练习建立模型，在模板支架、独立制作或功能扩展任务中逐步成长。",
      },
      {
        title: "项目深化",
        description:
          "围绕设计主题检查结构、比例与使用情境，保留版本对比和迭代依据。",
      },
      {
        title: "成果展示",
        description:
          "整理最终模型、设计过程与作品说明，在年度 3D 设计展中讲清设计选择。",
      },
    ],
    tags: ["空间思维", "数字设计", "三维作品"],
    grades: [...youthGrades],
    note: youthNote,
  },
  {
    id: "youth-gesture",
    category: "youth",
    title: "AI 粒子手势互动",
    subtitle: "挥一挥手，改变眼前的世界。",
    description:
      "连接计算机视觉与实时交互，探索摄像头如何理解动作、粒子如何回应手势。在一次次测试中，将身体动作变成创意表达的语言。",
    audience: "小学至高中 · 分学段教学",
    duration: "全年 30 节 × 45 分钟",
    outcomes: ["一个体感互动原型", "手势与响应测试记录", "年度互动装置展示"],
    stages: [
      {
        title: "通识与安全",
        description:
          "体验手势识别，了解计算机视觉的能力边界，建立摄像头使用与个人隐私规则。",
      },
      {
        title: "技能建构",
        description:
          "把手势与粒子变化建立对应关系，完成可操作的体感互动基础原型。",
      },
      {
        title: "项目深化",
        description:
          "测试不同动作与环境对识别的影响，记录问题，改进响应与体验。",
      },
      {
        title: "成果展示",
        description:
          "整理互动规则和测试证据，邀请观众体验，在年度互动装置展中说明设计。",
      },
    ],
    tags: ["计算机视觉", "体感交互", "互动装置"],
    grades: [...youthGrades],
    note: youthNote,
  },
  {
    id: "youth-avatar",
    category: "youth",
    title: "AI 虚拟形象专属智能助理",
    subtitle: "设计一个有角色、有边界的 AI 伙伴。",
    description:
      "从角色设定与静态数字人起步，理解智能对话和数字人系统。围绕一个明确任务，设计形象、表达方式与回答规则。",
    audience: "小学至高中 · 分学段教学",
    duration: "全年 30 节 × 45 分钟",
    outcomes: [
      "一个数字人作品或助理原型",
      "角色设定与对话测试记录",
      "年度数字人发布展示",
    ],
    stages: [
      {
        title: "通识与安全",
        description:
          "认识数字人与智能对话，区分角色表达和事实回答，了解肖像、隐私与生成内容的边界。",
      },
      {
        title: "技能建构",
        description:
          "确定角色用途与视觉设定，从静态形象出发完成符合学段目标的基础作品。",
      },
      {
        title: "项目深化",
        description:
          "围绕实际使用任务测试对话与表达，记录不合适的回应，逐步完善规则。",
      },
      {
        title: "成果展示",
        description: "展示数字人及适用情境，说明创作过程、测试结果和使用边界。",
      },
    ],
    tags: ["数字人", "智能对话", "角色设计"],
    grades: [...youthGrades],
    note: youthNote,
  },
  {
    id: "youth-game",
    category: "youth",
    title: "AI 小游戏开发",
    subtitle: "从玩家，变成规则的创造者。",
    description:
      "通过小游戏理解程序逻辑与系统设计。把想法写成规则，用原型验证玩法，在试玩与修改中学习如何解决问题。",
    audience: "小学至高中 · 分学段教学",
    duration: "全年 30 节 × 45 分钟",
    outcomes: [
      "一个可试玩的游戏原型",
      "玩法与测试迭代记录",
      "年度游戏发布介绍",
    ],
    stages: [
      {
        title: "通识与安全",
        description:
          "拆解熟悉的玩法，认识目标、规则与反馈，建立健康游戏和素材使用意识。",
      },
      {
        title: "技能建构",
        description:
          "将规则转化为程序逻辑，借助分层任务完成能够运行的互动游戏原型。",
      },
      {
        title: "项目深化",
        description:
          "开展同伴试玩，定位规则或交互问题，依据测试记录调整玩法与难度。",
      },
      {
        title: "成果展示",
        description:
          "整理游戏版本、操作说明与创作过程，在年度发布中演示并回应反馈。",
      },
    ],
    tags: ["程序逻辑", "游戏设计", "原型迭代"],
    grades: [...youthGrades],
    note: youthNote,
  },
  {
    id: "youth-robotics",
    category: "youth",
    title: "AI 机器人综合实践",
    subtitle: "让代码走进真实世界。",
    description:
      "把结构、感知与控制连接起来，理解机器人如何执行任务。在搭建、编程和反复调试中，练习工程整合与团队协作。",
    audience: "小学至高中 · 分学段教学",
    duration: "全年 30 节 × 45 分钟",
    outcomes: [
      "一个机器人任务方案",
      "搭建与调试过程记录",
      "年度机器人挑战展示",
    ],
    stages: [
      {
        title: "通识与安全",
        description:
          "认识机器人结构、感知和控制的关系，学习设备操作、用电与场地安全。",
      },
      {
        title: "技能建构",
        description:
          "从基础搭建与控制练习起步，让机器人完成与学段相匹配的基础任务。",
      },
      {
        title: "项目深化",
        description:
          "面向真实任务整合结构与程序，观察执行结果，记录故障并迭代解决方案。",
      },
      {
        title: "成果展示",
        description:
          "准备任务演示与工程说明，在年度机器人挑战中呈现个人贡献和团队成果。",
      },
    ],
    tags: ["工程思维", "智能控制", "团队挑战"],
    grades: [...youthGrades],
    note: youthNote,
  },
  {
    id: "adult-ai-literacy",
    category: "adult",
    title: "AI 通识素养课",
    subtitle: "理解 AI，也学会把任务交给 AI。",
    description:
      "面向成人与学生，从大模型、智能体到办公与开发实践，建立提问、计划、执行、验收的完整方法，形成自己的 AI 工作流。",
    audience: "成人与学生 · AI 应用入门",
    duration: "15 课时 × 60 分钟",
    outcomes: [
      "一份个人 AI 工作流",
      "一个结业项目与演示",
      "一份工具选型与使用建议",
    ],
    stages: [
      {
        title: "理解原理",
        description:
          "认识大模型的能力边界与幻觉，理解从对话到智能体的任务执行过程。",
      },
      {
        title: "搭建工作流",
        description:
          "学习 Claude Code、Codex 与 CodeBuddy 的基础使用，练习任务拆解、规则与结果验收。",
      },
      {
        title: "完成真实任务",
        description:
          "在文档、数据与开发场景中实践，比较工具表现，学习自动化与安全使用。",
      },
      {
        title: "项目路演",
        description:
          "完成结业项目，提交项目材料和五分钟演示，沉淀可复用的个人工作方法。",
      },
    ],
    tags: ["AI 通识", "智能体", "个人工作流"],
    note: "通识素养培训课程，不对应职业技能等级证书。具体工具与账号安排随开班方案确认。",
  },
  {
    id: "adult-ai-video",
    category: "adult",
    title: "AI 视频创作课",
    subtitle: "从脚本到成片，建立完整创作流程。",
    description:
      "以 LibTV 创作实践为线索，学习提示词、脚本、分镜与角色资产，延伸到电商、品牌视觉和设计场景，完成自己的结业作品。",
    audience: "内容创作者、设计师与品牌运营人员",
    duration: "15 课时 × 30 分钟",
    outcomes: [
      "一份脚本与分镜方案",
      "一组视觉或角色资产",
      "一件结业作品与创作说明",
    ],
    stages: [
      {
        title: "工具与表达",
        description:
          "熟悉 AI 视频工具和提示词方法，认识画面表达与版权使用要求。",
      },
      {
        title: "脚本与分镜",
        description: "围绕创作主题组织脚本、镜头和角色，形成可执行的视觉方案。",
      },
      {
        title: "场景实战",
        description:
          "练习电商、品牌、界面与产品视觉任务，理解一致性与素材复用。",
      },
      {
        title: "成片与路演",
        description:
          "整合创作素材，检查角色和视觉的一致性，完成结业作品并展示创作过程。",
      },
    ],
    tags: ["AI 影像", "脚本分镜", "品牌视觉"],
    note: "数字创意培训课程，不对应职业技能等级证书。以当期开班确认的工具与授权方案开展实训。",
  },
  {
    id: "adult-new-employees",
    category: "adult",
    title: "企业新员工 AI 素养课",
    subtitle: "入职第一课，建立可靠的 AI 协作习惯。",
    description:
      "围绕企业新人常见任务，学习智能体、代码库理解、办公自动化和结果复核。把数据安全与权限边界融入完整的项目实践。",
    audience: "企业新员工 · 研发与非研发岗位",
    duration: "15 课时 × 60 分钟",
    outcomes: [
      "一份岗位 AI 工作流",
      "一个可演示的结业项目",
      "一份工具对比与使用建议",
    ],
    stages: [
      {
        title: "建立共同认知",
        description:
          "理解大模型与智能体的机制，认识幻觉、权限和企业数据使用边界。",
      },
      {
        title: "搭建与协作",
        description:
          "实践 Claude Code、Codex、CodeBuddy 三条工具路线，建立项目规则和计划、执行、验收流程。",
      },
      {
        title: "岗位任务实战",
        description:
          "练习理解项目、修改与验证、数据处理和文档自动化，保留可检查的工作记录。",
      },
      {
        title: "交付与复盘",
        description:
          "完成结业项目和五分钟演示，整理项目材料，形成个人 AI 工作流。",
      },
    ],
    tags: ["新员工培养", "办公自动化", "项目实践"],
    note: "企业培训课程，不对应职业技能等级证书。工具接入、账号与实训数据按企业要求配置。",
  },
  {
    id: "adult-role-based",
    category: "adult",
    title: "企业全员分岗位 AI 通识课",
    subtitle: "从每个人会用，到每个岗位用得好。",
    description:
      "采用“通识 7＋岗位定制 6＋成果 2”的课程结构，围绕财务、人力、行政、业务、数据、IT 六类岗位，让学习直接连接工作任务。",
    audience: "企业全员 · 六类岗位定制",
    duration: "15 课时 × 60 分钟",
    outcomes: [
      "一组岗位代表作品",
      "部门提示词库与智能体资产包",
      "一份部门 AI 使用公约",
    ],
    stages: [
      {
        title: "通识与基础任务",
        description:
          "认识 AI 能做什么，学习结构化指令、文档表格、资料整理与智能体入门。",
      },
      {
        title: "安全与使用约定",
        description:
          "结合岗位识别敏感信息与错误风险，形成部门共同遵循的 AI 使用公约。",
      },
      {
        title: "六类岗位实训",
        description:
          "财务、人力、行政、业务、数据、IT 六选一分班，以六课时完成本岗位的可带走成果。",
      },
      {
        title: "作品互评与沉淀",
        description:
          "展示岗位代表作品，汇总提示词、智能体与工作方法，形成部门 AI 资产包。",
      },
    ],
    tags: ["岗位定制", "六类岗位", "部门资产"],
    note: "企业培训课程，不对应职业技能等级证书。以 WorkBuddy 为主要教学工具，结合企业实际环境调整。",
  },
  {
    id: "career-ai-trainer",
    category: "career",
    title: "人工智能训练师",
    subtitle: "理解训练流程，打好数据与实操基础。",
    description:
      "拟面向五级／初级工能力要求，学习人工智能基础、数据采集处理、多模态标注、质量检验与智能系统基础运维。",
    audience: "拟面向 AI 数据与训练相关岗位学习者",
    duration: "拟设 60 标准学时 · 理论 30＋实训 30",
    outcomes: [
      "一份数据处理与标注成果",
      "一份质检和返修记录",
      "一份基础运维与综合实训记录",
    ],
    stages: [
      {
        title: "职业与 AI 基础",
        description:
          "学习职业道德、人工智能与机器学习概念，理解数据在训练流程中的作用。",
      },
      {
        title: "采集、处理与标注",
        description:
          "按照任务规则整理数据，练习文本、图像与语音等类型的基础标注。",
      },
      {
        title: "质量与系统运维",
        description:
          "开展抽检、返修和基础运维，记录问题处理过程，落实安全与隐私要求。",
      },
      {
        title: "综合实训",
        description:
          "整合数据处理、标注和质检任务，以理论与实操方式检查学习成果。",
      },
    ],
    tags: ["数据处理", "质量检验", "职业能力"],
    status: "拟申报",
    note: careerNote,
  },
  {
    id: "career-data-labeling",
    category: "career",
    title: "人工智能数据标注",
    subtitle: "让数据准确、规范、可复核。",
    description:
      "拟设专项职业能力项目，围绕图像、文本、语音、视频与点云，学习标注规则、工具操作、抽检返修与隐私保护。",
    audience: "拟面向数据标注与质量检查岗位学习者",
    duration: "拟设 40 学时 · 理论 12＋实训 28",
    outcomes: [
      "一组多类型数据标注成果",
      "一份质量检查与返修报告",
      "一份数据安全自查清单",
    ],
    stages: [
      {
        title: "规范与工具",
        description: "解读任务需求与标注标准，认识工具平台和数据使用规则。",
      },
      {
        title: "多类型标注",
        description:
          "练习图像、文本、语音、视频和点云标注，建立一致的操作与记录习惯。",
      },
      {
        title: "抽检与返修",
        description: "依据规则检验质量，定位错误并返修，形成可复核的质检记录。",
      },
      {
        title: "综合实践",
        description:
          "完成包含标注、质检和安全自查的任务，以理论与实操方式检查掌握情况。",
      },
    ],
    tags: ["多模态标注", "抽检返修", "数据规范"],
    status: "拟申报",
    note: careerNote,
  },
  {
    id: "career-model-application",
    category: "career",
    title: "人工智能模型运用",
    subtitle: "选对模型，设计流程，验证结果。",
    description:
      "拟设专项职业能力项目，围绕岗位任务学习模型选型、结构化提示与工作流设计，并掌握输出复核、风险控制和数据合规方法。",
    audience: "拟面向 AI 应用与业务流程相关岗位学习者",
    duration: "拟设 40 学时 · 理论 14＋实训 26",
    outcomes: [
      "一组结构化提示词模板",
      "一份岗位工作流与成果集",
      "一份输出验证和合规自查记录",
    ],
    stages: [
      {
        title: "模型与能力边界",
        description: "理解大模型基本原理，结合岗位需要判断适用任务与模型选择。",
      },
      {
        title: "提示与工作流",
        description:
          "编写结构化指令，形成提示词模板，设计连接输入、处理与输出的工作流程。",
      },
      {
        title: "验证与岗位实践",
        description: "在业务任务中应用模型，对输出开展验证、复核与风险检查。",
      },
      {
        title: "综合应用",
        description:
          "整理岗位成果集、验证记录与合规清单，通过综合任务检验学习成果。",
      },
    ],
    tags: ["模型选型", "工作流设计", "输出验证"],
    status: "拟申报",
    note: careerNote,
  },
  {
    id: "camp-half-day",
    category: "camp",
    title: "AI 机器人科技研学 · 半日营",
    subtitle: "把第一份好奇，带到科技现场。",
    description:
      "以感知体验与兴趣激发为主，通过展厅导览、智造工厂探秘与机器人体验认识 AI。进阶方向可结合机器人搭建或无人机挑战。",
    audience: "中小学生 · 按年龄分组",
    duration: "半日 · 基础／进阶方案",
    outcomes: [
      "一份科技观察记录",
      "一次机器人互动任务",
      "一份研学分享与个人发现",
    ],
    stages: [
      {
        title: "带着问题出发",
        description: "完成活动与设备安全说明，带着自己的问题进入人工智能展厅。",
      },
      {
        title: "观察与体验",
        description:
          "探访智造工厂与机器人科技体验馆，把看到的技术与生活中的应用联系起来。",
      },
      {
        title: "动手与挑战",
        description:
          "按选定方案参与机器人互动；进阶活动可结合竞赛机器人或无人机项目开展。",
      },
      {
        title: "记录与分享",
        description: "整理观察、任务体验与新问题，在小组交流中说明自己的发现。",
      },
    ],
    tags: ["现场探索", "科技体验", "兴趣启蒙"],
    note: "依托合作基地及设备开展，具体地点、项目组合、时长与出行安排以当期研学方案为准。研学课程不对应职业技能等级证书。",
  },
  {
    id: "camp-full-day",
    category: "camp",
    title: "AI 机器人科技研学 · 一日营",
    subtitle: "从看懂机器人，到完成团队挑战。",
    description:
      "从展厅与智造现场的认知出发，走向机器人搭建、编程与工程挑战。竞赛方向进一步以全能挑战赛练习策略、调试与协作。",
    audience: "中小学生 · 按年龄分组",
    duration: "一日 · 标准／竞赛方案",
    outcomes: [
      "一份观察与工程任务记录",
      "一个小组挑战方案",
      "一份任务复盘与团队展示",
    ],
    stages: [
      {
        title: "认知与体验",
        description:
          "认识 AI 与机器人应用，完成安全说明，参观展厅、体验馆与智造场景。",
      },
      {
        title: "工程实践",
        description:
          "在导师指导下开展机器人搭建、编程及当期安排的工程项目，记录调试过程。",
      },
      {
        title: "团队挑战",
        description:
          "围绕任务共同制定策略并测试；竞赛方案进一步开展机器人全能挑战。",
      },
      {
        title: "复盘与展示",
        description:
          "结合任务结果解释方案与改进思路，呈现个人贡献、协作过程和学习收获。",
      },
    ],
    tags: ["工程实践", "团队协作", "挑战进阶"],
    note: "依托合作基地及设备开展，具体地点、项目组合、午休与时长以当期研学方案为准。研学课程不对应职业技能等级证书。",
  },
];

export const products: Product[] = [
  {
    id: "thesis-buddy",
    title: "论文搭子",
    subtitle: "THESIS BUDDY",
    description:
      "面向本、硕、博阶段的研究与写作辅助，连接选题、文献检索、知识整理、引用管理和答辩准备，让研究过程更有条理。",
    url: "https://mycryjmnznhs.sealoshzh.site",
    tags: ["学术辅助", "文献整理", "研究工作流"],
    status: "产品体验",
  },
  {
    id: "mistake-notebook",
    title: "AI 错题集",
    subtitle: "LEARNING COMPANION",
    description:
      "围绕错题整理、错因分析与变式练习，帮助学习者看见问题，也为教师与家长理解学习过程提供线索。",
    tags: ["错题整理", "错因分析", "学习支持"],
    status: "联系了解",
  },
  {
    id: "intelligent-web",
    title: "智能网页平台",
    subtitle: "CREATIVE WEB",
    description:
      "连接 AI 工具与教学场景的网页产品方向，让课程中的创意、内容和互动拥有可访问的呈现空间。具体功能与体验方案可联系了解。",
    tags: ["教学场景", "创意呈现", "互动网页"],
    status: "联系了解",
  },
  {
    id: "gesture-lab",
    title: "手势实验岛",
    subtitle: "GESTURE LAB",
    description:
      "通过摄像头识别手势，用动作驱动粒子与虚拟场景，在看得见的即时反馈中探索计算机视觉和人机交互。",
    url: "https://azncqrmjxtjw.sealoshzh.site",
    tags: ["手势识别", "粒子互动", "创意实验"],
    status: "产品体验",
  },
  {
    id: "world-lab",
    title: "三维世界实验室",
    subtitle: "VIDEO TO WORLD",
    description:
      "探索从二维视频到可浏览三维空间的转换，让影像素材成为空间体验的起点，连接数字建模与沉浸式表达。",
    url: "https://video2gauss.sealoshzh.site",
    tags: ["影像转空间", "三维探索", "沉浸表达"],
    status: "产品体验",
  },
  {
    id: "food-physics-lab",
    title: "食物物理实验室",
    subtitle: "FOOD PHYSICS LAB",
    description:
      "以可拖动、可形变的食物场景探索实时材质与物理交互。它是一项实验原型，用直观的操作把观察、参数与反馈连接起来。",
    tags: ["物理交互", "材质观察", "创作实验"],
    status: "实验原型",
  },
];

export const team: { name: string; role: string; description: string }[] = [
  {
    name: "常锦晴",
    role: "创始人 · 教育与创作",
    description:
      "从建筑与城市设计走向 AIGC 和教育，把空间思维、设计方法与一线科普教学连接起来，推动从理解技术到动手创造的学习。",
  },
  {
    name: "肖宇曼",
    role: "联合创始人 · 设计与运营",
    description:
      "深耕视觉传达、三维数字创作与 AI 设计，统筹视觉出品、项目运营和商务合作，让创作想法形成可落地的项目。",
  },
];
