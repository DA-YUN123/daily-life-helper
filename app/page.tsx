"use client";

import {
  BookOpenText,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Edit3,
  ExternalLink,
  Leaf,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Category = "공부" | "생활" | "건강" | "업무";
type Priority = "high" | "medium" | "low";
type TaskView = "today" | "all" | "completed";

type Task = {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  dueDate: string;
  duration: number;
  plan: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
};

type Habit = {
  id: string;
  name: string;
  color: "green" | "orange" | "blue";
  completedDates: string[];
};

type StoredData = {
  version: 1;
  tasks: Task[];
  habits: Habit[];
};

type TaskDraft = {
  title: string;
  category: Category;
  priority: Priority;
  dueDate: string;
  duration: number;
  plan: string;
};

const STORAGE_KEY = "daily-life-helper:v1";
const CATEGORIES: Category[] = ["공부", "생활", "건강", "업무"];
const PRIORITY_META: Record<
  Priority,
  { label: string; shortLabel: string }
> = {
  high: { label: "높음", shortLabel: "중요" },
  medium: { label: "보통", shortLabel: "보통" },
  low: { label: "낮음", shortLabel: "여유" },
};

const EVIDENCE = [
  {
    number: "01",
    title: "실행 의도 — ‘언제·어디서·무엇을’ 연결하기",
    description:
      "Gollwitzer의 실행 의도 연구는 목표를 상황 단서와 구체적인 행동으로 연결하는 계획을 다룹니다. 이를 할 일의 ‘실행 문장’ 입력으로 옮겼습니다.",
    source: "Gollwitzer (1999), American Psychologist",
    href: "https://doi.org/10.1037/0003-066X.54.7.493",
  },
  {
    number: "02",
    title: "진행 상황을 눈에 보이게 만들기",
    description:
      "138개 무작위 연구를 종합한 메타분석은 진행 상황 모니터링을 촉진하는 개입이 목표 달성과 관련 있음을 보고합니다. 오늘·주간 진행률을 그래서 전면에 배치했습니다.",
    source: "Harkin et al. (2016), Psychological Bulletin",
    href: "https://pubmed.ncbi.nlm.nih.gov/26479070/",
  },
  {
    number: "03",
    title: "누구나 조작하기 쉬운 인터페이스",
    description:
      "키보드 초점, 충분한 클릭 영역, 의미 있는 레이블을 적용했습니다. WCAG 2.2의 초점 표시와 최소 타깃 크기 기준을 설계 기준으로 삼았습니다.",
    source: "W3C, Web Content Accessibility Guidelines 2.2",
    href: "https://www.w3.org/TR/WCAG22/",
  },
  {
    number: "04",
    title: "가입 없이, 이 기기에만 저장",
    description:
      "할 일과 습관 기록은 브라우저의 localStorage에 저장됩니다. 서버 계정 없이 다시 방문해도 데이터를 유지하는 소규모 개인용 도구에 맞춘 선택입니다.",
    source: "MDN, Window.localStorage",
    href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
  },
] as const;

function dateKey(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function addDays(base: string, amount: number) {
  const date = new Date(base + "T00:00:00");
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

function formatHeadingDate(value: string) {
  if (!value) return "오늘";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(value + "T00:00:00"));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(value + "T00:00:00"));
}

function getWeekDates(today: string) {
  if (!today) return [];
  const current = new Date(today + "T00:00:00");
  const mondayOffset = current.getDay() === 0 ? -6 : 1 - current.getDay();
  const monday = addDays(today, mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return prefix + "-" + crypto.randomUUID();
  }
  return prefix + "-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function makeStarterTasks(today: string): Task[] {
  return [
    {
      id: "starter-task-1",
      title: "컴퓨터활용능력 실기 함수 3개 복습",
      category: "공부",
      priority: "high",
      dueDate: today,
      duration: 40,
      plan: "저녁 식사 후 책상에 앉으면 기출문제 1세트를 푼다.",
      completed: false,
      completedAt: null,
      createdAt: today,
    },
    {
      id: "starter-task-2",
      title: "이번 주 식비 내역 정리",
      category: "생활",
      priority: "medium",
      dueDate: today,
      duration: 20,
      plan: "오후 8시에 카드 앱을 열고 사용 내역을 생활비 표에 옮긴다.",
      completed: false,
      completedAt: null,
      createdAt: today,
    },
    {
      id: "starter-task-3",
      title: "지원할 기업 2곳 채용 공고 확인",
      category: "업무",
      priority: "high",
      dueDate: addDays(today, 1),
      duration: 30,
      plan: "오전 공부를 마치면 북마크한 채용 페이지부터 확인한다.",
      completed: false,
      completedAt: null,
      createdAt: today,
    },
    {
      id: "starter-task-4",
      title: "저녁 산책 20분",
      category: "건강",
      priority: "low",
      dueDate: today,
      duration: 20,
      plan: "저녁 식사 후 운동화를 신고 집 앞 공원을 한 바퀴 걷는다.",
      completed: true,
      completedAt: today,
      createdAt: today,
    },
  ];
}

function makeStarterHabits(today: string): Habit[] {
  return [
    {
      id: "starter-habit-1",
      name: "물 6잔 마시기",
      color: "green",
      completedDates: [addDays(today, -2), addDays(today, -1), today],
    },
    {
      id: "starter-habit-2",
      name: "영어 단어 20개",
      color: "blue",
      completedDates: [addDays(today, -3), addDays(today, -1)],
    },
    {
      id: "starter-habit-3",
      name: "자정 전 화면 끄기",
      color: "orange",
      completedDates: [addDays(today, -2), today],
    },
  ];
}

function dueLabel(dueDate: string, today: string, completed: boolean) {
  if (dueDate === today) return "오늘";
  if (dueDate === addDays(today, 1)) return "내일";
  if (!completed && dueDate < today) return "기한 지남";
  return formatShortDate(dueDate);
}

function taskSort(a: Task, b: Task) {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  const priorityOrder: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }
  return a.dueDate.localeCompare(b.dueDate);
}

export default function Home() {
  const [today, setToday] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<TaskView>("today");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"전체" | Category>("전체");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [draft, setDraft] = useState<TaskDraft>({
    title: "",
    category: "공부",
    priority: "medium",
    dueDate: "",
    duration: 30,
    plan: "",
  });
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      const currentToday = dateKey(new Date());
      setToday(currentToday);

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredData;
          if (
            parsed.version === 1 &&
            Array.isArray(parsed.tasks) &&
            Array.isArray(parsed.habits)
          ) {
            setTasks(parsed.tasks);
            setHabits(parsed.habits);
          } else {
            setTasks(makeStarterTasks(currentToday));
            setHabits(makeStarterHabits(currentToday));
          }
        } else {
          setTasks(makeStarterTasks(currentToday));
          setHabits(makeStarterHabits(currentToday));
        }
      } catch {
        setTasks(makeStarterTasks(currentToday));
        setHabits(makeStarterHabits(currentToday));
        setStatusMessage(
          "저장된 데이터를 읽지 못해 샘플 데이터로 시작했어요.",
        );
      } finally {
        setReady(true);
      }
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: StoredData = { version: 1, tasks, habits };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      window.queueMicrotask(() =>
        setStatusMessage("브라우저 저장 공간을 사용할 수 없어요."),
      );
    }
  }, [habits, ready, tasks]);

  useEffect(() => {
    if (!taskModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => titleInputRef.current?.focus(), 0);

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTaskModalOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [taskModalOpen]);

  useEffect(() => {
    if (!evidenceOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEvidenceOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [evidenceOpen]);

  const weekDates = useMemo(() => getWeekDates(today), [today]);
  const activeToday = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            !task.completed && Boolean(today) && task.dueDate <= today,
        )
        .sort(taskSort),
    [tasks, today],
  );

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    return tasks
      .filter((task) => {
        if (view === "today") {
          const belongsToToday =
            task.dueDate <= today || task.completedAt === today;
          if (!belongsToToday) return false;
        }
        if (view === "completed" && !task.completed) return false;
        if (view === "all" && task.completed) return false;
        if (category !== "전체" && task.category !== category) return false;
        if (
          normalizedQuery &&
          !(
            task.title.toLocaleLowerCase("ko-KR").includes(normalizedQuery) ||
            task.plan.toLocaleLowerCase("ko-KR").includes(normalizedQuery)
          )
        ) {
          return false;
        }
        return true;
      })
      .sort(taskSort);
  }, [category, query, tasks, today, view]);

  const todayRelevant = tasks.filter(
    (task) => task.dueDate <= today || task.completedAt === today,
  );
  const completedToday = todayRelevant.filter(
    (task) => task.completed && task.completedAt === today,
  ).length;
  const progress =
    todayRelevant.length > 0
      ? Math.round((completedToday / todayRelevant.length) * 100)
      : 0;
  const remainingMinutes = activeToday.reduce(
    (sum, task) => sum + task.duration,
    0,
  );
  const weekHabitChecks = habits.reduce(
    (sum, habit) =>
      sum +
      habit.completedDates.filter((date) => weekDates.includes(date)).length,
    0,
  );
  const weekHabitTotal = habits.length * Math.max(weekDates.length, 1);
  const habitProgress =
    weekHabitTotal > 0
      ? Math.round((weekHabitChecks / weekHabitTotal) * 100)
      : 0;

  function openNewTask() {
    setEditingTask(null);
    setDraft({
      title: "",
      category: "공부",
      priority: "medium",
      dueDate: today,
      duration: 30,
      plan: "",
    });
    setTaskModalOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setDraft({
      title: task.title,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      duration: task.duration,
      plan: task.plan,
    });
    setTaskModalOpen(true);
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedTitle = draft.title.trim();
    if (!cleanedTitle) return;

    if (editingTask) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...draft,
                title: cleanedTitle,
                plan: draft.plan.trim(),
              }
            : task,
        ),
      );
      setStatusMessage("할 일을 수정했어요.");
    } else {
      const newTask: Task = {
        id: makeId("task"),
        ...draft,
        title: cleanedTitle,
        plan: draft.plan.trim(),
        completed: false,
        completedAt: null,
        createdAt: today,
      };
      setTasks((current) => [newTask, ...current]);
      setStatusMessage("새 할 일을 추가했어요.");
    }
    setTaskModalOpen(false);
  }

  function toggleTask(taskId: string) {
    let completedTitle = "";
    let willComplete = false;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        completedTitle = task.title;
        willComplete = !task.completed;
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? today : null,
        };
      }),
    );
    setStatusMessage(
      willComplete
        ? completedTitle + " 완료. 잘했어요!"
        : completedTitle + "을(를) 다시 진행 중으로 바꿨어요.",
    );
  }

  function deleteTask(task: Task) {
    if (!window.confirm("‘" + task.title + "’ 할 일을 삭제할까요?")) return;
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setStatusMessage("할 일을 삭제했어요.");
  }

  function toggleHabit(habitId: string, day: string) {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) return habit;
        const checked = habit.completedDates.includes(day);
        return {
          ...habit,
          completedDates: checked
            ? habit.completedDates.filter((date) => date !== day)
            : [...habit.completedDates, day],
        };
      }),
    );
    setStatusMessage("습관 기록을 업데이트했어요.");
  }

  function addHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newHabitName.trim();
    if (!name) return;
    const colors: Habit["color"][] = ["green", "blue", "orange"];
    setHabits((current) => [
      ...current,
      {
        id: makeId("habit"),
        name,
        color: colors[current.length % colors.length],
        completedDates: [],
      },
    ]);
    setNewHabitName("");
    setHabitFormOpen(false);
    setStatusMessage("새 습관을 추가했어요.");
  }

  function deleteHabit(habit: Habit) {
    if (!window.confirm("‘" + habit.name + "’ 습관을 삭제할까요?")) return;
    setHabits((current) => current.filter((item) => item.id !== habit.id));
    setStatusMessage("습관을 삭제했어요.");
  }

  function resetSampleData() {
    if (
      !window.confirm(
        "현재 기록을 지우고 처음 샘플 데이터로 되돌릴까요? 이 작업은 되돌릴 수 없어요.",
      )
    ) {
      return;
    }
    setTasks(makeStarterTasks(today));
    setHabits(makeStarterHabits(today));
    setStatusMessage("샘플 데이터로 초기화했어요.");
  }

  function exportData() {
    const data: StoredData = { version: 1, tasks, habits };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "daily-life-helper-" + today + ".json";
    link.click();
    URL.revokeObjectURL(href);
    setStatusMessage("백업 파일을 내려받았어요.");
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <p className="sr-only" aria-live="polite">
        {statusMessage}
      </p>

      <header className="site-header">
        <a className="brand" href="#" aria-label="하루결 홈">
          <span className="brand-mark" aria-hidden="true">
            <Leaf size={19} strokeWidth={2.4} />
          </span>
          <span className="brand-copy">
            <strong>하루결</strong>
            <small>Daily Life Helper</small>
          </span>
        </a>
        <nav className="header-actions" aria-label="보조 메뉴">
          <button
            className="text-button"
            type="button"
            onClick={() => setEvidenceOpen(true)}
          >
            <BookOpenText size={17} aria-hidden="true" />
            설계 근거
          </button>
          <button className="text-button" type="button" onClick={exportData}>
            <Download size={17} aria-hidden="true" />
            데이터 백업
          </button>
          <button
            className="icon-button subtle"
            type="button"
            onClick={resetSampleData}
            aria-label="샘플 데이터로 초기화"
            title="샘플 데이터로 초기화"
          >
            <RefreshCcw size={18} aria-hidden="true" />
          </button>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <CalendarDays size={16} aria-hidden="true" />
              {formatHeadingDate(today)}
            </p>
            <h1 id="hero-title">
              해야 할 일은 더 작게,
              <br />
              오늘은 더 선명하게.
            </h1>
            <p className="hero-description">
              할 일과 습관을 한곳에 모으고, 바로 실행할 수 있는 다음 행동을
              정리하세요.
            </p>
          </div>
          <div className="hero-focus" aria-label="오늘의 핵심 할 일">
            <div className="focus-heading">
              <span>
                <Target size={17} aria-hidden="true" />
                오늘의 초점
              </span>
              <b>{activeToday.slice(0, 3).length}/3</b>
            </div>
            {ready ? (
              activeToday.length > 0 ? (
                <ol className="focus-list">
                  {activeToday.slice(0, 3).map((task, index) => (
                    <li key={task.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <button type="button" onClick={() => openEditTask(task)}>
                        {task.title}
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="focus-empty">
                  <CheckCircle2 size={22} aria-hidden="true" />
                  오늘 예정된 일을 모두 마쳤어요.
                </div>
              )
            ) : (
              <div className="loading-lines" aria-label="데이터 불러오는 중">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
        </section>

        <section className="summary-strip" aria-label="오늘 요약">
          <div className="summary-lead">
            <span className="summary-kicker">TODAY</span>
            <strong>{progress}%</strong>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: progress + "%" }} />
            </div>
            <p>오늘 계획 진행률</p>
          </div>
          <div className="summary-item">
            <span className="summary-icon mint" aria-hidden="true">
              <CheckCircle2 size={19} />
            </span>
            <div>
              <strong>
                {completedToday}
                <small>개</small>
              </strong>
              <p>오늘 완료</p>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon peach" aria-hidden="true">
              <Clock3 size={19} />
            </span>
            <div>
              <strong>
                {remainingMinutes}
                <small>분</small>
              </strong>
              <p>남은 예상 시간</p>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon sky" aria-hidden="true">
              <Sparkles size={19} />
            </span>
            <div>
              <strong>
                {habitProgress}
                <small>%</small>
              </strong>
              <p>주간 습관 달성</p>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <section className="task-section" aria-labelledby="task-heading">
            <div className="section-heading">
              <div>
                <p className="section-kicker">MY TASKS</p>
                <h2 id="task-heading">할 일 정리</h2>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={openNewTask}
              >
                <Plus size={18} aria-hidden="true" />
                할 일 추가
              </button>
            </div>

            <div className="task-toolbar">
              <div className="view-tabs" aria-label="할 일 보기">
                {(
                  [
                    ["today", "오늘"],
                    ["all", "전체"],
                    ["completed", "완료"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={view === value ? "active" : ""}
                    aria-pressed={view === value}
                    onClick={() => setView(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="toolbar-controls">
                <label className="search-field">
                  <Search size={17} aria-hidden="true" />
                  <span className="sr-only">할 일 검색</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="할 일 검색"
                  />
                </label>
                <label className="category-filter">
                  <span className="sr-only">카테고리 필터</span>
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as "전체" | Category)
                    }
                  >
                    <option value="전체">전체 분야</option>
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="task-list">
              {!ready ? (
                <div className="task-skeletons" aria-label="할 일 불러오는 중">
                  <span />
                  <span />
                  <span />
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <article
                    className={"task-row" + (task.completed ? " completed" : "")}
                    key={task.id}
                  >
                    <button
                      className="task-check"
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? task.title + " 완료 취소"
                          : task.title + " 완료 처리"
                      }
                      aria-pressed={task.completed}
                    >
                      {task.completed && <Check size={17} aria-hidden="true" />}
                    </button>
                    <div className="task-body">
                      <div className="task-title-line">
                        <h3>{task.title}</h3>
                        <span
                          className={"priority-dot " + task.priority}
                          title={"우선순위 " + PRIORITY_META[task.priority].label}
                        >
                          {PRIORITY_META[task.priority].shortLabel}
                        </span>
                      </div>
                      <div className="task-meta">
                        <span>{task.category}</span>
                        <span
                          className={
                            !task.completed && task.dueDate < today
                              ? "overdue"
                              : ""
                          }
                        >
                          <CalendarDays size={14} aria-hidden="true" />
                          {dueLabel(task.dueDate, today, task.completed)}
                        </span>
                        <span>
                          <Clock3 size={14} aria-hidden="true" />
                          {task.duration}분
                        </span>
                      </div>
                      {task.plan && (
                        <p className="task-plan">
                          <span>실행</span>
                          {task.plan}
                        </p>
                      )}
                    </div>
                    <div className="task-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => openEditTask(task)}
                        aria-label={task.title + " 수정"}
                        title="수정"
                      >
                        <Edit3 size={17} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => deleteTask(task)}
                        aria-label={task.title + " 삭제"}
                        title="삭제"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span aria-hidden="true">
                    <CheckCircle2 size={30} />
                  </span>
                  <h3>조건에 맞는 할 일이 없어요</h3>
                  <p>새로운 할 일을 추가하거나 필터를 바꿔보세요.</p>
                  <button type="button" onClick={openNewTask}>
                    <Plus size={16} aria-hidden="true" />
                    첫 할 일 추가
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="habit-section" aria-labelledby="habit-heading">
            <div className="section-heading compact">
              <div>
                <p className="section-kicker">WEEKLY RHYTHM</p>
                <h2 id="habit-heading">이번 주 습관</h2>
              </div>
              <button
                className="small-button"
                type="button"
                onClick={() => setHabitFormOpen((current) => !current)}
                aria-expanded={habitFormOpen}
              >
                <Plus size={16} aria-hidden="true" />
                습관
              </button>
            </div>

            {habitFormOpen && (
              <form className="habit-form" onSubmit={addHabit}>
                <label>
                  <span className="sr-only">새 습관 이름</span>
                  <input
                    value={newHabitName}
                    onChange={(event) => setNewHabitName(event.target.value)}
                    placeholder="예: 일본어 기사 1개 읽기"
                    maxLength={40}
                    autoFocus
                  />
                </label>
                <button type="submit">추가</button>
              </form>
            )}

            <div className="week-header" aria-hidden="true">
              <span />
              {weekDates.map((day) => (
                <span key={day} className={day === today ? "today" : ""}>
                  <small>
                    {
                      ["일", "월", "화", "수", "목", "금", "토"][
                        new Date(day + "T00:00:00").getDay()
                      ]
                    }
                  </small>
                  <b>{new Date(day + "T00:00:00").getDate()}</b>
                </span>
              ))}
            </div>

            <div className="habit-list">
              {habits.map((habit) => (
                <div className="habit-row" key={habit.id}>
                  <div className="habit-name">
                    <span
                      className={"habit-color " + habit.color}
                      aria-hidden="true"
                    />
                    <span>{habit.name}</span>
                    <button
                      type="button"
                      onClick={() => deleteHabit(habit)}
                      aria-label={habit.name + " 습관 삭제"}
                      title="습관 삭제"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="habit-days">
                    {weekDates.map((day) => {
                      const checked = habit.completedDates.includes(day);
                      return (
                        <button
                          key={day}
                          className={
                            (checked ? "checked " : "") + habit.color
                          }
                          type="button"
                          onClick={() => toggleHabit(habit.id, day)}
                          aria-label={
                            habit.name +
                            " " +
                            formatShortDate(day) +
                            (checked ? " 완료 취소" : " 완료")
                          }
                          aria-pressed={checked}
                        >
                          {checked && <Check size={14} aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="habit-summary">
              <div>
                <span>이번 주 기록</span>
                <strong>
                  {weekHabitChecks}
                  <small> / {weekHabitTotal}</small>
                </strong>
              </div>
              <div
                className="habit-progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={habitProgress}
                aria-label="이번 주 습관 달성률"
              >
                <span style={{ width: habitProgress + "%" }} />
              </div>
              <p>
                완벽한 연속 기록보다, 다시 시작하기 쉬운 흐름을 만들어 보세요.
              </p>
            </div>

            <div className="privacy-note">
              <span aria-hidden="true">
                <Leaf size={17} />
              </span>
              <p>
                <strong>내 기록은 이 브라우저에만</strong>
                로그인 없이 기기에 저장되며, JSON 파일로 백업할 수 있어요.
              </p>
            </div>
          </aside>
        </div>

        <section className="evidence-callout" aria-labelledby="evidence-title">
          <div className="evidence-callout-icon" aria-hidden="true">
            <BookOpenText size={24} />
          </div>
          <div>
            <p className="section-kicker">DESIGN WITH EVIDENCE</p>
            <h2 id="evidence-title">감이 아니라 근거에서 시작한 기능</h2>
            <p>
              실행 문장, 진행률 시각화, 접근 가능한 조작 영역, 로컬 저장까지
              각 기능의 출처와 적용 범위를 투명하게 정리했습니다.
            </p>
          </div>
          <button type="button" onClick={() => setEvidenceOpen(true)}>
            근거 4개 보기
            <ExternalLink size={16} aria-hidden="true" />
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#">
          <span className="brand-mark" aria-hidden="true">
            <Leaf size={17} />
          </span>
          <span className="brand-copy">
            <strong>하루결</strong>
            <small>Daily Life Helper</small>
          </span>
        </a>
        <p>
          하루를 잘 해내기보다, 다시 시작하기 쉽게. · Portfolio project
          2026
        </p>
      </footer>

      {taskModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTaskModalOpen(false);
          }}
        >
          <section
            className="modal-card task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            <div className="modal-heading">
              <div>
                <p className="section-kicker">
                  {editingTask ? "EDIT TASK" : "NEW TASK"}
                </p>
                <h2 id="task-modal-title">
                  {editingTask ? "할 일 수정" : "새 할 일 추가"}
                </h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setTaskModalOpen(false)}
                aria-label="창 닫기"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form className="task-form" onSubmit={saveTask}>
              <label className="form-field full">
                <span>할 일 이름</span>
                <input
                  ref={titleInputRef}
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="무엇을 끝내고 싶나요?"
                  maxLength={80}
                  required
                />
              </label>

              <div className="form-grid">
                <label className="form-field">
                  <span>분야</span>
                  <select
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        category: event.target.value as Category,
                      }))
                    }
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>우선순위</span>
                  <select
                    value={draft.priority}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        priority: event.target.value as Priority,
                      }))
                    }
                  >
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>마감일</span>
                  <input
                    type="date"
                    value={draft.dueDate}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="form-field">
                  <span>예상 시간</span>
                  <span className="input-with-unit">
                    <input
                      type="number"
                      min={5}
                      max={480}
                      step={5}
                      value={draft.duration}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          duration: Number(event.target.value),
                        }))
                      }
                      required
                    />
                    <small>분</small>
                  </span>
                </label>
              </div>

              <label className="form-field full">
                <span>
                  실행 문장 <em>선택</em>
                </span>
                <textarea
                  value={draft.plan}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      plan: event.target.value,
                    }))
                  }
                  placeholder="예: 저녁 식사 후 책상에 앉으면 기출문제 1세트를 푼다."
                  rows={3}
                  maxLength={160}
                />
                <small className="field-help">
                  언제·어디서·무엇을 할지 한 문장으로 적으면 시작 조건이
                  선명해져요.
                </small>
              </label>

              <div className="form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                >
                  취소
                </button>
                <button className="primary-button" type="submit">
                  {editingTask ? "수정 저장" : "할 일 추가"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {evidenceOpen && (
        <div
          className="modal-backdrop evidence-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEvidenceOpen(false);
          }}
        >
          <section
            className="modal-card evidence-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="evidence-modal-title"
          >
            <div className="modal-heading evidence-modal-heading">
              <div>
                <p className="section-kicker">SOURCES & RATIONALE</p>
                <h2 id="evidence-modal-title">기능을 이렇게 설계한 이유</h2>
                <p>
                  연구 결과를 과장하지 않고, 제품 기능으로 옮긴 지점을
                  구체적으로 밝혔습니다.
                </p>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setEvidenceOpen(false)}
                aria-label="창 닫기"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="evidence-list">
              {EVIDENCE.map((item) => (
                <article className="evidence-item" key={item.number}>
                  <span className="evidence-number">{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.source}
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <p className="evidence-caveat">
              <strong>적용 범위:</strong> 위 연구는 기능 아이디어의 근거이며,
              이 앱 자체의 효과를 검증한 임상·실험 결과는 아닙니다. 사용자의
              상황과 목표에 맞게 도구를 조정해 사용하세요.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
