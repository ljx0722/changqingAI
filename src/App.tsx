import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Check,
  X,
  Menu,
  Search,
  Phone,
  Copy,
  Download,
  RotateCcw,
  Pause,
  Play,
  Compass,
  GraduationCap,
  FlaskConical,
  Building2,
  GalleryHorizontalEnd,
  Users,
  Sun,
  MousePointer2,
  BookOpen,
  Film,
  Boxes,
  Bot,
  Hand,
  Gamepad2,
  Sparkles,
  Layers3,
  ChevronDown,
  Move,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  categories,
  grades,
  courses,
  products,
  team,
  type Category,
  type Grade,
  type Course,
} from "./data/content";
import { COMPANY, CONTACT } from "./config";
import { parseCatalog, filterCourses, inquiryText } from "./catalog";
import type { RegionId, WorldController } from "./world";

const regions: {
  id: RegionId;
  name: string;
  english: string;
  title: ReactNode;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    id: "philosophy",
    name: "理念广场",
    english: "OUR PHILOSOPHY",
    title: (
      <>
        让每一个想象，
        <br />
        都有
        <span className="sun-word">
          晴天
          <Sun aria-hidden="true" />
        </span>
        。
      </>
    ),
    description:
      "以自研 AI 工具连接素养教学与成品交付。让每个人都能理解 AI、运用 AI，创造自己的作品。",
    icon: Sun,
  },
  {
    id: "academy",
    name: "长晴学院",
    english: "LEARNING & CREATING",
    title: (
      <>
        从一份好奇，
        <br />
        到自己的作品。
      </>
    ),
    description:
      "青少年科技素养、成人与企业培训、职业培训项目、机器人研学。找到适合你的学习起点。",
    icon: GraduationCap,
  },
  {
    id: "tools",
    name: "工具实验室",
    english: "TOOLS FOR IMAGINATION",
    title: (
      <>
        让好想法，
        <br />
        有实现的工具。
      </>
    ),
    description:
      "从研究辅助、互动实验到三维创作，让 AI 能力走进看得见、用得上的真实场景。",
    icon: FlaskConical,
  },
  {
    id: "studio",
    name: "企业共创",
    english: "IDEAS INTO PRACTICE",
    title: (
      <>
        一起，把想法
        <br />
        做成下一步。
      </>
    ),
    description:
      "从企业 AI 培训到品牌影像、数字人和专属工具，以具体业务问题为起点，走向实际交付。",
    icon: Building2,
  },
  {
    id: "works",
    name: "成果展馆",
    english: "MADE WITH CHANGQING",
    title: (
      <>
        创造的答案，
        <br />
        藏在作品里。
      </>
    ),
    description:
      "看见课堂上的第一次创作，也看见走入真实业务的设计。每一件作品，都是学习与实践的连接。",
    icon: GalleryHorizontalEnd,
  },
  {
    id: "team",
    name: "团队基地",
    english: "PEOPLE BEHIND THE IDEAS",
    title: (
      <>
        起源于设计，
        <br />
        相聚于创造。
      </>
    ),
    description:
      "教育、设计、算法与产品工程，在同一张工作台前相遇。我们一起搭建通向创造的路。",
    icon: Users,
  },
];
const courseMedia: Record<string, string> = {
  "youth-film": "film",
  "youth-modeling": "model",
  "youth-gesture": "gesture",
  "youth-avatar": "avatar",
  "youth-game": "game",
  "youth-robotics": "robot",
};
const courseIcons = [Film, Boxes, Hand, Bot, Gamepad2, Layers3];
const workItems = [
  {
    id: "film",
    image: "film",
    type: "影像创作",
    title: "一伞烟雨江南",
    subtitle: "用 AI 讲述有温度的东方故事",
    description:
      "以油纸伞为线索，将主题构思、视觉风格与镜头表达连接起来。这份微电影示例，让脚本、画面与成片之间的创作过程变得可见。",
    tags: ["AI 微电影", "视觉叙事", "作品表达"],
    course: "youth-film",
    process: [
      "构思故事主题与叙事线索",
      "设计角色、场景与镜头",
      "生成、筛选并组织视觉素材",
      "剪辑成片，检查叙事与素材使用",
    ],
  },
  {
    id: "soda",
    image: "soda",
    type: "企业共创",
    title: "SODA · 品牌 IP 影像",
    subtitle: "让品牌形象走进自己的故事",
    description:
      "围绕新加坡 SODA 集团的企业 IP 形象，探索角色设定与场景化影像呈现。用 AI 创作方法连接品牌识别、角色表现和传播内容。",
    tags: ["企业 IP", "AI 影像", "品牌表达"],
    course: null,
    process: [
      "明确品牌风格与传播场景",
      "形成 IP 角色与视觉语言",
      "制作场景化内容",
      "整理适合应用的交付素材",
    ],
  },
  {
    id: "robot",
    image: "robot",
    type: "工程实践",
    title: "让代码，走进现实",
    subtitle: "在机器人实践中理解工程",
    description:
      "机器人编程与调试，将屏幕上的逻辑变成真实动作。围绕任务进行搭建、控制、测试与改进，在动手过程中观察问题、解释结果。",
    tags: ["机器人实践", "程序逻辑", "团队协作"],
    course: "youth-robotics",
    process: [
      "理解任务与设备安全",
      "搭建并编写控制逻辑",
      "观察运动、定位问题",
      "复盘调试记录与解决方案",
    ],
  },
];

function downloadText(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      el.close();
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <button
          className="close-button"
          aria-label="关闭详情"
          onClick={onClose}
        >
          <X size={22} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

function WorldView({
  selected,
  onSelect,
  reading,
  setReading,
}: {
  selected: RegionId | null;
  onSelect: (id: RegionId | null) => void;
  reading: boolean;
  setReading: (value: boolean) => void;
}) {
  const mount = useRef<HTMLDivElement>(null),
    shell = useRef<HTMLDivElement>(null),
    controller = useRef<WorldController | null>(null),
    selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const reduced = useRef(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [paused, setPaused] = useState(reduced.current),
    [interactive, setInteractive] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [fullscreen, setFullscreen] = useState(false);
  const region = regions.find((r) => r.id === selected);
  const latest = useRef({ selected, paused, interactive });
  latest.current = { selected, paused, interactive };
  useEffect(() => {
    if (reading) return;
    let canceled = false;
    setReady(false);
    setError("");
    import("./world")
      .then(async (module) => {
        if (canceled || !mount.current) return;
        const result = await module.createWorld(mount.current, {
          reducedMotion: reduced.current,
          forceWebGL:
            new URLSearchParams(location.search).get("renderer") === "webgl",
          onSelect: (id) => {
            if (!canceled) selectRef.current(id);
          },
          onReady: (backend) => {
            if (!canceled) {
              setReady(true);
              mount.current?.setAttribute("data-renderer", backend);
            }
          },
          onError: (message) => {
            if (!canceled) setError(message);
          },
        });
        if (canceled) result.dispose();
        else {
          controller.current = result;
          result.setPaused(latest.current.paused);
          result.setInteractive(latest.current.interactive);
          if (latest.current.selected) result.select(latest.current.selected);
        }
      })
      .catch(() => {
        if (!canceled)
          setError(
            "此设备暂时无法呈现三维园区，可以通过下方导览继续浏览全部内容。",
          );
      });
    return () => {
      canceled = true;
      controller.current?.dispose();
      controller.current = null;
    };
  }, [reading, retry]);
  useEffect(() => {
    if (selected) controller.current?.select(selected);
    else controller.current?.reset();
  }, [selected]);
  useEffect(() => {
    controller.current?.setPaused(paused);
  }, [paused]);
  useEffect(() => {
    controller.current?.setInteractive(interactive);
  }, [interactive]);
  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.body.style.overflow,
      focus = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    shell.current
      ?.querySelector<HTMLButtonElement>('[aria-label="退出大图"]')
      ?.focus();
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "Tab") {
        const items = [
          ...shell.current!.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ),
        ];
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
      focus?.focus();
    };
  }, [fullscreen]);
  return (
    <div
      ref={shell}
      className={`world-shell ${fullscreen ? "expanded" : ""}`}
      role={fullscreen ? "dialog" : undefined}
      aria-modal={fullscreen ? true : undefined}
      aria-label={fullscreen ? "展开的长晴创作园区" : undefined}
    >
      <div className="world-topline">
        <span>
          <i /> CHANGQING CREATIVE CAMPUS
        </span>
        <span>
          数字展厅 ·{" "}
          {selected
            ? String(regions.findIndex((r) => r.id === selected) + 1).padStart(
                2,
                "0",
              )
            : "总览"}{" "}
          / 06
        </span>
      </div>
      {reading ? (
        <div className="reading-map">
          <div className="map-heading">
            <Compass size={38} aria-hidden="true" />
            <h3>选择你的下一站</h3>
            <p>用内容导览探索长晴的世界</p>
          </div>
          <div>
            {regions.map((r, i) => (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={selected === r.id ? "active" : ""}
              >
                <r.icon size={21} aria-hidden="true" />
                <span>{r.name}</span>
                <small>0{i + 1}</small>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            ref={mount}
            className={`world-mount ${interactive ? "interactive" : ""}`}
            role="img"
            aria-label="长晴创作园区三维导览"
          />
          {!ready && !error && (
            <div className="world-loading">
              <span className="loading-orbit" aria-hidden="true" />
              <span>为你打开长晴的世界</span>
            </div>
          )}
          {error && (
            <div className="world-error" role="status">
              <Compass size={30} aria-hidden="true" />
              <p>{error}</p>
              <div>
                <button onClick={() => setRetry((v) => v + 1)}>重新加载</button>
                <button onClick={() => setReading(true)}>进入内容导览</button>
              </div>
            </div>
          )}
        </>
      )}
      <div className="world-caption">
        <span className="compass-mark">
          N <Compass size={25} strokeWidth={1} aria-hidden="true" />
        </span>
        <p>
          {region ? region.name : "一个让学习、工具与创作相遇的地方"}
          <small>
            {region
              ? "点击下方「了解这一站」阅读完整内容"
              : "概念园区 · 点击建筑选择展馆"}
          </small>
        </p>
      </div>
      <div className="world-controls" aria-label="三维浏览控制">
        {!reading && (
          <>
            <button
              className={interactive ? "selected" : ""}
              aria-pressed={interactive}
              onClick={() => setInteractive((v) => !v)}
              disabled={!ready || !!error}
            >
              <Move size={16} />
              <span>{interactive ? "退出旋转" : "自由浏览"}</span>
            </button>
            <button
              title={paused ? "开启动效" : "暂停动效"}
              aria-label={paused ? "开启动效" : "暂停动效"}
              aria-pressed={paused}
              onClick={() => setPaused((v) => !v)}
              disabled={!ready || !!error}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              title="重置视角"
              aria-label="重置视角"
              disabled={!ready || !!error}
              onClick={() => {
                controller.current?.reset();
                onSelect(null);
              }}
            >
              <RotateCcw size={16} />
            </button>
          </>
        )}
        <button
          title={reading ? "返回三维园区" : "切换内容导览"}
          aria-label={reading ? "返回三维园区" : "切换内容导览"}
          aria-pressed={reading}
          onClick={() => setReading(!reading)}
        >
          <BookOpen size={16} />
        </button>
        <button
          title={fullscreen ? "退出大图" : "展开园区"}
          aria-label={fullscreen ? "退出大图" : "展开园区"}
          aria-expanded={fullscreen}
          onClick={() => setFullscreen((v) => !v)}
        >
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
      {interactive && !reading && (
        <div className="interaction-hint">
          拖动旋转 · 双指缩放 · 点击建筑进入展馆
        </div>
      )}
    </div>
  );
}

export default function App() {
  const initial = parseCatalog(location.hash);
  const [selected, setSelected] = useState<RegionId | null>(null),
    [menu, setMenu] = useState(false),
    [reading, setReading] = useState(
      new URLSearchParams(location.search).get("view") === "reading",
    ),
    [category, setCategory] = useState<Category>(initial.category),
    [grade, setGrade] = useState<Grade>(initial.grade),
    [query, setQuery] = useState(initial.query),
    [openedCourse, setOpenedCourse] = useState<Course | null>(null),
    [openedWork, setOpenedWork] = useState<(typeof workItems)[number] | null>(
      null,
    ),
    [privacy, setPrivacy] = useState(false),
    [toast, setToast] = useState(""),
    [topic, setTopic] = useState("课程体验"),
    [role, setRole] = useState("家长 / 学生"),
    [name, setName] = useState(""),
    [goal, setGoal] = useState(""),
    [summary, setSummary] = useState(""),
    [activeNav, setActiveNav] = useState("home");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const region = regions.find((r) => r.id === selected) || regions[0];
  const currentCategory = categories.find((c) => c.id === category)!;
  const filtered = filterCourses(category, grade, query);
  const flash = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash("已复制，可直接粘贴使用");
    } catch {
      downloadText(text, "长晴AI-沟通内容.txt");
      flash("复制不可用，已改为下载文本");
    }
  };
  const go = (id: string) => {
    setMenu(false);
    setOpenedCourse(null);
    setOpenedWork(null);
    location.hash = id;
    requestAnimationFrame(() =>
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        }),
    );
  };
  const inquire = (value: string) => {
    setTopic(value);
    setSummary("");
    go("contact");
  };
  const openCourse = (course: Course) => {
    setOpenedCourse(course);
    history.pushState(null, "", `#course/${course.id}`);
  };
  const closeCourse = () => {
    setOpenedCourse(null);
    history.replaceState(null, "", "#academy");
  };
  const updateCatalog = (
    next: Partial<{ category: Category; grade: Grade; query: string }>,
  ) => {
    const c = next.category || category,
      g =
        next.category && next.category !== category
          ? "all"
          : next.grade || grade,
      q = next.query === undefined ? query : next.query;
    setCategory(c);
    setGrade(g);
    setQuery(q);
    const params = new URLSearchParams({ category: c });
    if (g !== "all") params.set("grade", g);
    if (q) params.set("q", q);
    history.replaceState(null, "", `#academy?${params}`);
  };
  useEffect(() => {
    const sync = () => {
      const hash = location.hash.slice(1);
      if (hash.startsWith("course/")) {
        const course = courses.find((c) => c.id === hash.slice(7));
        if (course) {
          setOpenedCourse(course);
          setCategory(course.category);
        }
      } else {
        setOpenedCourse(null);
        if (hash.startsWith("academy")) {
          const state = parseCatalog(location.hash);
          setCategory(state.category);
          setGrade(state.grade);
          setQuery(state.query);
        }
        const target = hash.split("?")[0];
        if (target)
          requestAnimationFrame(() =>
            document
              .getElementById(target)
              ?.scrollIntoView({ behavior: "instant" }),
          );
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveNav(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    document
      .querySelectorAll("main>section[id]")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const generate = (e: FormEvent) => {
    e.preventDefault();
    setSummary(inquiryText({ name, role, topic, goal }));
  };
  return (
    <>
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="长晴AI首页">
          <span className="brand-symbol">
            <Sun size={26} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="brand-word">
            长晴<span>CHANGQING AI</span>
          </span>
        </a>
        <nav
          className={menu ? "header-nav open" : "header-nav"}
          aria-label="主导航"
        >
          {[
            ["home", "探索世界"],
            ["philosophy", "我们的理念"],
            ["academy", "课程体系"],
            ["tools", "产品与工具"],
            ["works", "作品与实践"],
            ["team", "关于我们"],
          ].map(([id, title]) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeNav === id ? "active" : ""}
              aria-current={activeNav === id ? "location" : undefined}
              onClick={() => setMenu(false)}
            >
              {title}
            </a>
          ))}
        </nav>
        <a className="header-contact" href="#contact">
          开启共创 <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <button
          className="menu-toggle"
          aria-label={menu ? "关闭菜单" : "打开菜单"}
          aria-expanded={menu}
          onClick={() => setMenu((v) => !v)}
        >
          {menu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>
      <main id="main">
        <section className="hero section-anchor" id="home">
          <div className="hero-main">
            <div className="hero-copy" key={region.id}>
              <div className="eyebrow">
                <span className="live-dot" /> {region.english}
              </div>
              <h1>{region.title}</h1>
              <p>{region.description}</p>
              <div className="hero-actions">
                <button
                  className="button primary"
                  onClick={() => {
                    if (selected) go(selected);
                    else {
                      setSelected("academy");
                    }
                  }}
                >
                  {selected ? "了解这一站" : "探索长晴的世界"}
                  <ArrowUpRight size={18} />
                </button>
                <button className="text-button" onClick={() => go("academy")}>
                  寻找适合的课程 <ArrowRight size={16} />
                </button>
              </div>
              <div className="hero-note">
                <span className="line" />
                <span>授之以鱼，也授之以渔。</span>
              </div>
            </div>
            <WorldView
              selected={selected}
              onSelect={setSelected}
              reading={reading}
              setReading={setReading}
            />
          </div>
          <div className="world-rail">
            <div className="rail-intro">
              <Compass size={19} />
              <div>
                你的探索，从这里开始<span>CHOOSE YOUR NEXT STOP</span>
              </div>
            </div>
            <div className="region-list" aria-label="园区展馆">
              {regions.map((r, i) => (
                <button
                  key={r.id}
                  className={selected === r.id ? "selected" : ""}
                  aria-pressed={selected === r.id}
                  onClick={() => setSelected(r.id)}
                >
                  <small>0{i + 1}</small>
                  <r.icon size={20} strokeWidth={1.5} />
                  <span>{r.name}</span>
                  <ArrowUpRight size={13} />
                </button>
              ))}
            </div>
            <a className="scroll-cue" href="#philosophy" aria-label="向下阅读">
              <ArrowDown size={20} />
            </a>
          </div>
        </section>

        <section
          className="philosophy section-pad section-anchor"
          id="philosophy"
        >
          <div className="section-top">
            <span className="eyebrow">01 / WHY WE CREATE</span>
            <span className="section-aside">AI 工具 + 素养教学 + 成品交付</span>
          </div>
          <div className="philosophy-heading">
            <h2>
              技术的下一步，
              <br />
              是人的<span>创造力。</span>
            </h2>
            <div>
              <p className="large-copy">
                我们希望，每个人都能成为
                <br />
                AI 时代的创造者。
              </p>
              <p className="body-copy">
                长晴从设计出发，把技术变成可以理解、可以动手、可以分享的体验。我们既提供解决问题的工具，也陪伴学习者形成自己的方法，让一次学习走向持续创造。
              </p>
              <a className="text-button" href="#team">
                认识长晴 <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <div className="beliefs">
            {[
              {
                n: "01",
                title: "从理解开始",
                english: "UNDERSTAND",
                text: "理解 AI 能做什么，以及它的边界。问题意识与独立判断，是每次创作的起点。",
                icon: BookOpen,
              },
              {
                n: "02",
                title: "在实践中成长",
                english: "CREATE",
                text: "把知识带进真实任务，用作品和工作流回应问题。做出来，再观察、验证和迭代。",
                icon: Layers3,
              },
              {
                n: "03",
                title: "让成果有责任",
                english: "REFLECT",
                text: "关注事实、版权与协作。留存过程与证据，让表达有依据，让成长被看见。",
                icon: Sun,
              },
            ].map((item) => (
              <article key={item.n}>
                <div>
                  <span>{item.n}</span>
                  <item.icon size={26} strokeWidth={1.2} />
                </div>
                <h3>{item.title}</h3>
                <small>{item.english}</small>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="academy section-pad section-anchor" id="academy">
          <div className="section-top">
            <span className="eyebrow">02 / CHANGQING ACADEMY</span>
            <span className="section-aside">每一种好奇，都有自己的路径</span>
          </div>
          <div className="section-heading">
            <h2>
              找到你的
              <br />
              <span>创造起点。</span>
            </h2>
            <p>
              从小学到高中，从个人成长到企业应用。
              <br />
              以四大课程体系，连接不同阶段的学习与实践。
            </p>
          </div>
          <div className="category-tabs" role="tablist" aria-label="课程类别">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                id={`tab-${cat.id}`}
                role="tab"
                tabIndex={category === cat.id ? 0 : -1}
                onKeyDown={(e) => {
                  const step =
                    e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? categories.length - 1
                        : step
                          ? (i + step + categories.length) % categories.length
                          : -1;
                  if (next >= 0) {
                    e.preventDefault();
                    updateCatalog({ category: categories[next].id });
                    document
                      .getElementById(`tab-${categories[next].id}`)
                      ?.focus();
                  }
                }}
                aria-selected={category === cat.id}
                aria-controls="catalog"
                className={category === cat.id ? "active" : ""}
                onClick={() => updateCatalog({ category: cat.id })}
              >
                <span>0{i + 1}</span>
                {cat.name}
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
          <div className="catalog-intro">
            <div>
              <h3>{currentCategory.name}</h3>
              <p>{currentCategory.description}</p>
            </div>
            <div className="catalog-controls">
              <label className="search-field">
                <Search size={17} />
                <input
                  aria-label="搜索当前类别课程"
                  placeholder="寻找感兴趣的课程"
                  value={query}
                  maxLength={80}
                  onChange={(e) => updateCatalog({ query: e.target.value })}
                />
                {query && (
                  <button
                    aria-label="清空搜索"
                    onClick={() => updateCatalog({ query: "" })}
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
              {category === "youth" && (
                <label className="grade-field">
                  <select
                    aria-label="选择学段"
                    value={grade}
                    onChange={(e) =>
                      updateCatalog({ grade: e.target.value as Grade })
                    }
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} />
                </label>
              )}
            </div>
          </div>
          <div className="catalog-count" role="status">
            {filtered.length} 个学习方向
            {category === "youth" && (
              <>
                {" "}
                · {grades.find((g) => g.id === grade)?.name} · 同题分层 /
                异龄协作
              </>
            )}
          </div>
          <div
            className="course-grid"
            id="catalog"
            role="tabpanel"
            aria-labelledby={`tab-${category}`}
          >
            {filtered.map((course, i) => {
              const asset = courseMedia[course.id];
              const Icon = courseIcons[i % 6];
              return (
                <article
                  className={`course-card course-${category}`}
                  key={course.id}
                >
                  <button
                    className="course-cover"
                    onClick={() => openCourse(course)}
                    aria-label={`查看${course.title}详情`}
                  >
                    {asset ? (
                      <img
                        src={`/media/${asset}.webp`}
                        alt={`${course.title}课程作品示例`}
                        loading="lazy"
                        width="600"
                        height="360"
                      />
                    ) : (
                      <div className={`course-illustration ill-${i % 4}`}>
                        <Icon size={68} strokeWidth={0.8} />
                        <span>{currentCategory.label}</span>
                      </div>
                    )}
                    <span className="cover-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="cover-link">
                      <ArrowUpRight size={19} />
                    </span>
                    {course.status && (
                      <span className="status-label">{course.status}</span>
                    )}
                  </button>
                  <div className="course-body">
                    <div className="tags">
                      {course.tags.slice(0, 2).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <h3>
                      <button onClick={() => openCourse(course)}>
                        {course.title}
                      </button>
                    </h3>
                    <p>{course.subtitle}</p>
                    <div className="course-footer">
                      <span>{course.duration}</span>
                      <button
                        aria-label={`了解${course.title}`}
                        onClick={() => openCourse(course)}
                      >
                        <ArrowRight size={19} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search size={32} />
              <h3>还没找到匹配的课程</h3>
              <p>试试“视频”“机器人”或切换课程类别。</p>
              <button
                className="button outline"
                onClick={() => updateCatalog({ query: "", grade: "all" })}
              >
                清空筛选
              </button>
            </div>
          )}
          <div className="academy-bottom">
            <span>
              <GraduationCap size={22} />
              不知道从哪一门开始？我们可以一起聊聊。
            </span>
            <button
              className="text-button"
              onClick={() => inquire("课程路径咨询")}
            >
              让常老师帮你规划 <ArrowUpRight size={17} />
            </button>
          </div>
        </section>

        <section className="tools section-pad section-anchor" id="tools">
          <div className="section-top">
            <span className="eyebrow">03 / TOOLS FOR CREATORS</span>
            <span className="section-aside">把复杂能力，交到创造者手中</span>
          </div>
          <div className="section-heading">
            <h2>
              好工具，
              <br />
              让创作发生。
            </h2>
            <p>
              服务学习、研究和数字创作。
              <br />
              在真实场景中，找到属于你的 AI 助手。
            </p>
          </div>
          <div className="product-list">
            {products.map((product, i) => (
              <article className="product-row" key={product.id}>
                <span className="product-number">0{i + 1}</span>
                <div className={`product-emblem emblem-${i % 4}`}>
                  {i === 0 ? (
                    <BookOpen />
                  ) : i === 3 ? (
                    <Hand />
                  ) : i === 4 ? (
                    <Boxes />
                  ) : (
                    <Sparkles />
                  )}
                </div>
                <div className="product-name">
                  <h3>{product.title}</h3>
                  <small>{product.subtitle}</small>
                </div>
                <p>{product.description}</p>
                <div className="product-action">
                  <span>{product.status}</span>
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`在新窗口体验${product.title}`}
                    >
                      <ArrowUpRight size={22} />
                    </a>
                  ) : product.id === "food-physics-lab" ? (
                    <a
                      href="https://changqing-food-lab.sealoshzh.site/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="在新窗口体验食物物理实验室"
                    >
                      <ArrowUpRight size={22} />
                    </a>
                  ) : (
                    <button
                      onClick={() => inquire(`产品了解：${product.title}`)}
                      aria-label={`咨询${product.title}`}
                    >
                      <ArrowUpRight size={22} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="studio section-pad section-anchor" id="studio">
          <div className="studio-layout">
            <div className="studio-copy">
              <span className="eyebrow">04 / CO-CREATION STUDIO</span>
              <h2>
                从“能做什么”，
                <br />
                到“我们来做”。
              </h2>
              <p>
                围绕你的真实问题，把课程、工具与内容交付组合成合适的方案。让 AI
                进入业务，也让团队拥有持续使用它的能力。
              </p>
              <button
                className="button primary"
                onClick={() => inquire("企业 / 学校共创方案")}
              >
                聊聊你的项目 <ArrowUpRight size={18} />
              </button>
              <div className="studio-signature">
                <span>DEFINE</span>
                <i />
                <span>CO-CREATE</span>
                <i />
                <span>DELIVER</span>
              </div>
            </div>
            <div className="service-list">
              {[
                {
                  title: "企业与品牌",
                  tag: "BUSINESS",
                  body: "企业 AI 素养与岗位培训、品牌 IP、AI 宣传影像、数字人及定制工具。",
                  target: "企业品牌合作",
                  icon: Building2,
                },
                {
                  title: "学校与教育机构",
                  tag: "EDUCATION",
                  body: "学校社团、课程共建、教师培训、教学工具与项目实践支持。",
                  target: "学校 / 教育机构合作",
                  icon: GraduationCap,
                },
                {
                  title: "渠道与共创伙伴",
                  tag: "PARTNERS",
                  body: "课程输出、研学项目、内容合作与联合交付，把资源连接成实际体验。",
                  target: "渠道与研学合作",
                  icon: Users,
                },
              ].map((item) => (
                <button key={item.tag} onClick={() => inquire(item.target)}>
                  <item.icon size={26} strokeWidth={1.2} />
                  <div>
                    <small>{item.tag}</small>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <ArrowUpRight size={22} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="works section-pad section-anchor" id="works">
          <div className="section-top">
            <span className="eyebrow">05 / SELECTED WORKS</span>
            <span className="section-aside">看见作品，也看见创造的过程</span>
          </div>
          <div className="section-heading">
            <h2>
              让作品，<span>自己说话。</span>
            </h2>
            <p>教育与真实应用，在这里相遇。</p>
          </div>
          <div className="works-grid">
            {workItems.map((work, i) => (
              <button
                className={`work-card work-${i}`}
                key={work.id}
                onClick={() => setOpenedWork(work)}
              >
                <div className="work-image">
                  <img
                    src={`/media/${work.image}.webp`}
                    alt={work.title}
                    width="1000"
                    height="600"
                    loading="lazy"
                  />
                  <span>
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <div className="work-info">
                  <small>
                    {work.type} / 0{i + 1}
                  </small>
                  <h3>{work.title}</h3>
                  <p>{work.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="classroom-strip">
            <img
              src="/media/classroom.webp"
              width="450"
              height="270"
              loading="lazy"
              alt="长晴AI微电影课堂教学现场"
            />
            <div>
              <span className="eyebrow">IN THE CLASSROOM</span>
              <h3>
                每一次“我做到了”，
                <br />
                都值得被看见。
              </h3>
              <p>
                从课堂练习到项目呈现，记录尝试、反馈与迭代。我们关心作品，也关心作品背后的成长。
              </p>
              <a className="text-button" href="#academy">
                回到课程学院 <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="team section-pad section-anchor" id="team">
          <div className="section-top">
            <span className="eyebrow">06 / MEET CHANGQING</span>
            <span className="section-aside">起源于设计，向创造相聚</span>
          </div>
          <div className="section-heading">
            <h2>
              有方法，
              <br />
              也有<span>温度。</span>
            </h2>
            <p>
              把设计的想象力、教育的耐心与工程的严谨，
              <br />
              放在同一个团队里。
            </p>
          </div>
          <div className="team-grid">
            {team.map((person, i) => (
              <article key={person.name}>
                <img
                  src={`/media/${i === 0 ? "founder" : "cofounder"}.webp`}
                  alt={`${person.name}工作与活动现场`}
                  loading="lazy"
                  width="500"
                  height="500"
                />
                <div>
                  <small>{person.role}</small>
                  <h3>{person.name}</h3>
                  <p>{person.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="expertise">
            <span>跨学科，一起做成事。</span>
            {[
              "视觉与空间设计",
              "AI 课程教研",
              "产品与工程",
              "算法与三维交互",
            ].map((item) => (
              <span key={item}>
                {item}
                <ArrowUpRight size={14} />
              </span>
            ))}
          </div>
        </section>

        <section className="faq section-pad">
          <div>
            <span className="eyebrow">A FEW THINGS TO KNOW</span>
            <h2>你可能想了解</h2>
            <a className="text-button" href={CONTACT.tel}>
              和常老师聊聊 <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="faq-list">
            {[
              {
                q: "没有编程基础，可以学习吗？",
                a: "可以从适合的通识与体验课程开始。青少年课程按四个学段分层，成人课程也包含从认识 AI 到完成任务的入门路径。具体建议可根据学习目标与已有经验一起确定。",
              },
              {
                q: "青少年课程怎么分层？",
                a: "六个创作主题覆盖小学 1—3 年级、小学 4—6 年级、初中与高中。围绕同一主题提供基础、标准和挑战任务，重视异龄协作与个人成长记录。",
              },
              {
                q: "企业可以定制培训或交付方案吗？",
                a: "可以围绕具体岗位、业务流程、团队基础与期望成果沟通。企业全员课程包含通识、岗位定制与成果展示，也可结合品牌影像、数字内容和专属工具形成合作方案。",
              },
              {
                q: "职业培训项目是否已经开班？",
                a: "目前展示的人工智能训练师、数据标注、模型运用三个项目属于拟申报课程。开班、报名条件及认定安排以当期正式公告为准，不承诺证书或补贴。",
              },
              {
                q: "课程费用、上课地点和时间如何确定？",
                a: "根据课程类型、人数、学段及交付方式确定。机器人研学的基地、时长与活动安排以当期方案为准。请联系常老师 17821821196 获取适合你的具体安排。",
              },
            ].map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <span>+</span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="contact section-pad section-anchor" id="contact">
          <div className="contact-layout">
            <div>
              <span className="eyebrow">LET’S CREATE SOMETHING</span>
              <h2>
                下一个想法，
                <br />
                一起<span>实现。</span>
              </h2>
              <p>
                一门课程，一次实验，或一个正在酝酿的项目。
                <br />
                从一场交流开始。
              </p>
              <a className="phone-card" href={CONTACT.tel}>
                <span className="phone-icon">
                  <Phone size={25} />
                </span>
                <span>
                  <small>{CONTACT.name} · 课程与合作咨询</small>
                  <strong>{CONTACT.phone}</strong>
                </span>
                <ArrowUpRight size={23} />
              </a>
              <button
                className="text-button"
                onClick={() => copy(`${CONTACT.name} ${CONTACT.phone}`)}
              >
                <Copy size={15} /> 复制联系方式
              </button>
              <div className="company-sign">
                {COMPANY}
                <span>长晴AI · 点亮未来，赋能成长</span>
              </div>
            </div>
            <div className="inquiry-card">
              <div className="inquiry-heading">
                <div>
                  <span className="eyebrow">BEFORE WE TALK</span>
                  <h3>带上你的想法</h3>
                </div>
                <ArrowUpRight size={26} />
              </div>
              <p className="form-explainer">
                整理一份沟通清单，再联系常老师。内容仅在当前页面生成。
              </p>
              <form onSubmit={generate}>
                <div className="form-row">
                  <label>
                    怎么称呼你
                    <input
                      value={name}
                      maxLength={40}
                      onChange={(e) => {
                        setName(e.target.value);
                        setSummary("");
                      }}
                      placeholder="称呼（选填）"
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    你的身份
                    <select
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        setSummary("");
                      }}
                    >
                      {[
                        "家长 / 学生",
                        "个人学习者",
                        "学校 / 教育机构",
                        "企业 / 品牌",
                        "合作伙伴",
                      ].map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  感兴趣的方向
                  <input
                    value={topic}
                    maxLength={100}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setSummary("");
                    }}
                    required
                    placeholder="课程、产品或合作方向"
                  />
                </label>
                <label>
                  希望解决什么问题
                  <textarea
                    rows={3}
                    maxLength={1500}
                    value={goal}
                    onChange={(e) => {
                      setGoal(e.target.value);
                      setSummary("");
                    }}
                    required
                    placeholder="例如：给初中社团设计一学期的 AI 创作课……"
                  />
                </label>
                <button
                  className="button primary generate-button"
                  type="submit"
                >
                  生成沟通清单 <ArrowRight size={17} />
                </button>
              </form>
              {summary && (
                <div className="inquiry-result" role="status">
                  <h4>
                    <Check size={17} /> 清单已准备好
                  </h4>
                  <p>选择复制或下载，沟通时发给常老师。</p>
                  <div>
                    <button onClick={() => copy(summary)}>
                      <Copy size={15} />
                      复制清单
                    </button>
                    <button
                      onClick={() =>
                        downloadText(summary, "长晴AI-合作沟通清单.txt")
                      }
                    >
                      <Download size={15} />
                      下载清单
                    </button>
                  </div>
                </div>
              )}
              <button className="privacy-link" onClick={() => setPrivacy(true)}>
                隐私与内容使用说明
              </button>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <a className="brand" href="#home">
            <Sun size={30} strokeWidth={1.3} />
            <span className="brand-word">
              长晴<span>CHANGQING AI</span>
            </span>
          </a>
          <p>授之以鱼，也授之以渔。</p>
          <a href="#home">
            回到世界起点 <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 {COMPANY}</span>
          <span>点亮未来，赋能成长</span>
          <button onClick={() => setPrivacy(true)}>隐私说明</button>
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {openedCourse && (
        <Modal title={openedCourse.title} onClose={closeCourse} wide>
          <div className="course-detail">
            <div className="detail-heading">
              <span className="eyebrow">
                {categories.find((c) => c.id === openedCourse.category)?.name}
              </span>
              {openedCourse.status && (
                <span className="status-label inline">
                  {openedCourse.status}
                </span>
              )}
              <h2>{openedCourse.title}</h2>
              <p>{openedCourse.subtitle}</p>
            </div>
            <div className="detail-facts">
              <div>
                <small>适合人群</small>
                <strong>{openedCourse.audience}</strong>
              </div>
              <div>
                <small>课程安排</small>
                <strong>{openedCourse.duration}</strong>
              </div>
            </div>
            <p className="detail-description">{openedCourse.description}</p>
            {openedCourse.category === "youth" && (
              <div className="grade-note">
                <GraduationCap size={20} />
                <span>
                  {grade === "all"
                    ? "四学段分层教学"
                    : grades.find((g) => g.id === grade)?.name}{" "}
                  · 基础 / 标准 / 挑战三级任务
                </span>
              </div>
            )}
            <h3>一步步，完成自己的创作</h3>
            <ol className="learning-path">
              {openedCourse.stages.map((stage, i) => (
                <li key={stage.title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h4>{stage.title}</h4>
                    <p>{stage.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="outcomes">
              <h3>你将练习完成</h3>
              {openedCourse.outcomes.map((outcome) => (
                <p key={outcome}>
                  <Check size={16} />
                  {outcome}
                </p>
              ))}
              <small>
                上述为课程学习目标，具体成果随学习阶段与项目实施而定。
              </small>
            </div>
            {openedCourse.note && (
              <p className="detail-note">{openedCourse.note}</p>
            )}
            <div className="detail-actions">
              <button
                className="button primary"
                onClick={() => inquire(`课程咨询：${openedCourse.title}`)}
              >
                咨询这门课程 <ArrowUpRight size={18} />
              </button>
              <button
                className="button outline"
                onClick={() =>
                  copy(
                    `${location.origin}${location.pathname}#course/${openedCourse.id}`,
                  )
                }
              >
                <Copy size={16} />
                复制课程链接
              </button>
            </div>
          </div>
        </Modal>
      )}
      {openedWork && (
        <Modal
          title={openedWork.title}
          onClose={() => setOpenedWork(null)}
          wide
        >
          <div className="work-detail">
            <img
              src={`/media/${openedWork.image}.webp`}
              alt={openedWork.title}
            />
            <div>
              <span className="eyebrow">{openedWork.type}</span>
              <h2>{openedWork.title}</h2>
              <p>{openedWork.description}</p>
              <div className="tags">
                {openedWork.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <h3>相关创作方法</h3>
              <ol className="work-process">
                {openedWork.process.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              <p className="detail-note">
                作品与现场图源自长晴团队原有介绍资料。课程示例用于说明创作方向。
              </p>
              <button
                className="button primary"
                onClick={() => {
                  const course = courses.find(
                    (c) => c.id === openedWork.course,
                  );
                  if (course) {
                    setOpenedWork(null);
                    openCourse(course);
                  } else inquire("企业 IP 与品牌影像合作");
                }}
              >
                {openedWork.course ? "了解相关课程" : "讨论类似项目"}
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>
        </Modal>
      )}
      {privacy && (
        <Modal title="隐私与内容使用说明" onClose={() => setPrivacy(false)}>
          <div className="privacy-content">
            <span className="eyebrow">PRIVACY & CONTENT</span>
            <h2>隐私与内容使用说明</h2>
            <h3>沟通清单</h3>
            <p>
              你填写的称呼、身份、方向与问题，仅在当前浏览器页面中用于生成沟通清单。本网站不会将这些内容提交到服务器，也不会自动保存。复制会写入你的剪贴板，下载会生成本地文本文件，离开页面后未保存的内容会丢失。
            </p>
            <h3>联系与外部产品</h3>
            <p>
              拨号按钮会调用设备的电话功能。产品体验链接在新窗口打开相应产品，其数据处理规则由对应产品说明。
            </p>
            <h3>三维体验与内容</h3>
            <p>
              三维园区为概念数字展厅，用于组织官网内容，不代表实际办公或教学场所。三维浏览无需相机和麦克风权限。本网站未接入第三方广告或访问统计工具。
            </p>
            <h3>课程信息</h3>
            <p>
              课程成果为培养目标。职业培训项目处于拟申报阶段，实际开班、认定与研学安排以正式通知为准。
            </p>
            <h3>联系我们</h3>
            <p>
              {COMPANY}
              <br />
              {CONTACT.name}：{CONTACT.phone}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
