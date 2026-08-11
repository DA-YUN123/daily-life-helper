# Daily Life Helper — 하루결

> 해야 할 일은 더 작게, 오늘은 더 선명하게.

[실행 중인 웹앱 바로 보기](https://daily-life-helper.odayun321.chatgpt.site)

Daily Life Helper는 오늘의 할 일과 주간 습관을 한 화면에서 관리하는
개인용 생산성 웹앱입니다. 단순히 항목을 나열하는 데서 끝나지 않고,
각 할 일에 실행 조건을 적고 진행 상황을 바로 확인할 수 있도록
설계했습니다.

이 프로젝트는 프론트엔드 상태 관리, CRUD, 브라우저 저장소, 반응형 UI,
접근성, 근거 기반 제품 설계를 하나의 완성된 사용자 경험으로 보여주는
포트폴리오 프로젝트입니다.

## 핵심 문제

할 일 관리 도구를 사용해도 다음 문제가 자주 남습니다.

1. 목표가 추상적이어서 실제로 언제 시작할지 결정하기 어렵습니다.
2. 오늘 해야 할 일과 장기 목록이 섞여 우선순위가 흐려집니다.
3. 진행 상황이 눈에 보이지 않아 꾸준함을 체감하기 어렵습니다.
4. 회원가입이나 서버 저장이 부담스러운 개인 기록도 있습니다.

하루결은 이 문제를 다음 방식으로 해결합니다.

- 오늘 마감이거나 기한이 지난 일만 별도로 모아 보여줍니다.
- 우선순위, 분야, 마감일, 예상 시간을 구조화해 기록합니다.
- “언제·어디서·무엇을 할지” 실행 문장을 선택적으로 작성합니다.
- 오늘 완료율과 주간 습관 달성률을 즉시 계산합니다.
- 회원가입 없이 브라우저에 저장하고 JSON으로 백업합니다.

## 주요 기능

### 1. 할 일 CRUD

- 새 할 일 생성
- 기존 할 일 수정
- 완료 및 완료 취소
- 삭제 전 확인
- 공부·생활·건강·업무 분야 구분
- 높음·보통·낮음 우선순위
- 마감일과 예상 소요 시간

### 2. 오늘 중심 보기

- 오늘 마감 또는 기한이 지난 할 일 자동 집계
- 오늘의 초점 최대 3개 표시
- 오늘, 전체, 완료 탭
- 제목과 실행 문장 검색
- 분야별 필터

### 3. 실행 문장

할 일을 추가할 때 다음과 같은 구체적인 실행 조건을 함께 적을 수 있습니다.

    저녁 식사 후 책상에 앉으면 기출문제 1세트를 푼다.

목표만 적는 대신 상황 단서와 행동을 연결하도록 돕는 기능입니다.

### 4. 주간 습관 기록

- 월요일부터 일요일까지 일주일 보기
- 날짜별 완료 토글
- 습관 추가 및 삭제
- 주간 달성률 자동 계산

### 5. 로컬 저장과 백업

- 할 일과 습관을 localStorage에 자동 저장
- 새로고침하거나 브라우저를 다시 열어도 기록 유지
- 전체 데이터를 JSON 파일로 내보내기
- 샘플 데이터 초기화

## 기능 설계의 근거

| 설계 선택 | 제품에 적용한 방식 | 근거 및 출처 |
| --- | --- | --- |
| 실행 조건을 구체적으로 작성 | 할 일마다 “언제·어디서·무엇을” 포함한 실행 문장 입력 | Peter M. Gollwitzer, “Implementation Intentions: Strong Effects of Simple Plans,” American Psychologist 54(7), 493–503, 1999. [DOI 10.1037/0003-066X.54.7.493](https://doi.org/10.1037/0003-066X.54.7.493) |
| 진행 상황을 시각화 | 오늘 완료율, 남은 예상 시간, 주간 습관 달성률 제공 | Harkin et al., “Does Monitoring Goal Progress Promote Goal Attainment? A Meta-Analysis of the Experimental Evidence,” Psychological Bulletin 142(2), 198–229, 2016. 138개 연구, 총 19,951명 분석. [PubMed](https://pubmed.ncbi.nlm.nih.gov/26479070/) · [DOI 10.1037/bul0000025](https://doi.org/10.1037/bul0000025) |
| 명확한 키보드 초점과 충분한 클릭 영역 | focus-visible 스타일, 의미 있는 레이블, 최소 24px 이상의 조작 영역 | W3C, [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/), 특히 2.4.7 Focus Visible과 2.5.8 Target Size (Minimum) |
| 계정 없는 기기 내 저장 | 브라우저 origin 단위 localStorage 사용 | MDN, [Window: localStorage property](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |

### 해석상 주의점

위 연구와 표준은 기능 아이디어와 인터페이스 결정의 근거입니다.
이 앱 자체가 사용자의 생산성이나 건강을 향상한다고 실험적으로 검증한
결과는 아닙니다. 특히 목표 달성은 과제의 난이도, 동기, 환경 등 여러
조건의 영향을 받으므로 연구 결과를 앱의 효과 보장으로 해석하지 않습니다.

## 사용자 경험 설계

### 정보 구조

| 영역 | 역할 |
| --- | --- |
| 상단 소개 | 오늘 날짜와 앱의 핵심 가치 전달 |
| 오늘의 초점 | 당장 처리할 핵심 작업 최대 3개 노출 |
| 요약 영역 | 오늘 완료율, 완료 수, 남은 시간, 습관 달성률 |
| 할 일 영역 | 생성·검색·필터·수정·완료·삭제 |
| 습관 영역 | 7일 기록과 주간 진행률 |
| 설계 근거 | 연구·표준·기술 문서의 출처와 적용 범위 |

### 접근성

- 문서 언어를 한국어로 선언
- 본문 바로가기 링크 제공
- 모든 아이콘 버튼에 접근 가능한 이름 제공
- 완료 상태를 aria-pressed로 전달
- 상태 변경 내용을 aria-live로 안내
- 키보드 사용자를 위한 명확한 focus-visible 표시
- 마우스 없이도 모든 주요 기능 사용 가능
- 운영체제의 동작 줄이기 설정을 반영
- 모바일에서도 충분한 터치 영역 유지

## 기술 스택

| 기술 | 사용 목적 |
| --- | --- |
| React 19 | 컴포넌트와 인터랙션 상태 관리 |
| TypeScript 5 | Task, Habit, StoredData 등 도메인 타입 정의 |
| Next.js 호환 App Router | 페이지 구조와 메타데이터 |
| Vinext + Vite | Cloudflare 호환 빌드와 빠른 개발 환경 |
| CSS + Tailwind CSS 4 기반 | 반응형 레이아웃과 디자인 토큰 |
| Lucide React | 의미가 일관된 인터페이스 아이콘 |
| Web Storage API | 서버 없는 기기 내 데이터 유지 |
| Node test runner | 빌드 결과 HTML 스모크 테스트 |

공식 문서:

- [React Learn](https://react.dev/learn)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Guide](https://vite.dev/guide/)
- [Lucide Guide](https://lucide.dev/guide/packages/lucide-react)

## 데이터 구조

할 일은 다음 정보를 가집니다.

    type Task = {
      id: string;
      title: string;
      category: "공부" | "생활" | "건강" | "업무";
      priority: "high" | "medium" | "low";
      dueDate: string;
      duration: number;
      plan: string;
      completed: boolean;
      completedAt: string | null;
      createdAt: string;
    };

습관은 다음 정보를 가집니다.

    type Habit = {
      id: string;
      name: string;
      color: "green" | "orange" | "blue";
      completedDates: string[];
    };

두 목록은 버전 정보를 포함한 하나의 객체로 직렬화됩니다.

    {
      "version": 1,
      "tasks": [],
      "habits": []
    }

저장 키는 daily-life-helper:v1입니다. 버전 필드를 둔 이유는 향후 데이터
구조를 변경할 때 마이그레이션할 여지를 남기기 위해서입니다.

## 폴더 구조

    daily-life-helper/
    ├── app/
    │   ├── globals.css       # 디자인 토큰, 반응형 UI, 접근성 스타일
    │   ├── layout.tsx        # 한국어 문서와 메타데이터
    │   └── page.tsx          # 데이터 모델, 상태, CRUD, 전체 화면
    ├── public/
    │   └── favicon.svg
    ├── tests/
    │   └── rendered-html.test.mjs
    ├── .openai/
    │   └── hosting.json      # 배포 환경 설정
    ├── package.json
    └── README.md

## 로컬 실행

### 요구 사항

- Node.js 22.13 이상
- npm
- Linux 또는 Windows의 WSL 권장

### 설치

    git clone https://github.com/DA-YUN123/daily-life-helper.git
    cd daily-life-helper
    npm install

### 개발 서버

    npm run dev:local

브라우저에서 터미널에 표시된 주소를 엽니다.

### 정적 검사

    npm run lint

### 프로덕션 빌드와 테스트

    npm test

테스트 명령은 프로덕션 산출물을 만든 뒤 다음 항목을 확인합니다.

- HTTP 200 응답
- HTML 콘텐츠 타입
- 한국어 문서 언어
- Daily Life Helper 문서 제목
- 개발 미리보기 메타데이터
- 핵심 제품 문구

## 주요 구현 결정

### 왜 서버 데이터베이스를 사용하지 않았나

첫 버전은 개인이 한 기기에서 사용하는 작은 도구에 초점을 맞췄습니다.
회원가입과 개인정보 전송을 요구하지 않고 즉시 사용할 수 있도록
localStorage를 선택했습니다. 서버 비용과 인증 복잡도를 줄이고
프론트엔드 상태 관리 역량을 명확히 보여주는 장점도 있습니다.

### 왜 오늘의 초점을 3개로 제한했나

전체 목록은 그대로 유지하되 첫 화면에서는 중요한 일을 빠르게 파악하도록
상위 3개만 보여줍니다. 이는 연구에서 직접 도출한 보편적 최적 숫자라는
주장이 아니라, 정보 과부하를 줄이기 위한 제품 범위 결정입니다.

### 왜 외부 차트 라이브러리를 사용하지 않았나

현재 시각화는 단일 진행률이므로 HTML과 CSS만으로 충분히 표현할 수
있습니다. 불필요한 번들 크기와 의존성을 늘리지 않는 방향을 택했습니다.

## 개인정보와 한계

- 데이터는 현재 브라우저와 사이트 주소에 종속됩니다.
- 브라우저 데이터 삭제 시 기록도 삭제될 수 있습니다.
- 시크릿 모드에서는 마지막 시크릿 창을 닫으면 기록이 사라질 수 있습니다.
- 다른 기기와 자동으로 동기화되지 않습니다.
- 여러 사용자가 공동으로 편집하는 기능은 없습니다.
- 중요한 기록은 데이터 백업 버튼으로 정기적으로 내려받는 것이 좋습니다.

## 향후 개선 계획

1. JSON 백업 파일 가져오기
2. 반복 할 일과 알림
3. 월간 통계와 카테고리별 시간 분석
4. 선택적 계정 로그인과 기기 간 동기화
5. Playwright 기반 주요 사용자 흐름 자동화
6. 다국어 UI

## 검증 범위

- TypeScript strict 모드
- ESLint
- 프로덕션 빌드
- 배포 산출물 검증
- 렌더링 HTML 스모크 테스트
- 데스크톱 및 모바일 레이아웃 수동 확인
- 할 일 생성·수정·완료·삭제 수동 확인
- 습관 추가·삭제·날짜별 체크 수동 확인
- 새로고침 후 localStorage 복원 수동 확인

## 라이선스

현재 별도의 오픈소스 라이선스를 부여하지 않았습니다.
공개 저장소에서 코드를 열람할 수 있다는 사실만으로 복제·배포·상업적
이용 권한이 자동으로 부여되지는 않습니다.
