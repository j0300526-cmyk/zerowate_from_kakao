import React from "react";
import { Plus, X, Leaf } from "lucide-react";
import Confetti from "react-confetti";
import SegmentedControl from "../components/SegmentedControl";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { CatalogMission, Mission, PersonalMissionEntry, WeekDay } from "../types";
import { groupMissionApi } from "../api/groupMission";
import { saveDayMissions, loadDayMissions, saveWeeklyRoutineCompletion } from "../utils/personalMissionsStorage";

interface Props {
  userName: string;
  profileColor: string;
  weekDays: WeekDay[];
  selectedDate: string | null;
  setSelectedDate: (d: string) => void;
  activeTab: "personal" | "group";
  setActiveTab: (t: "personal" | "group") => void;
  formatDate: () => string;
  isToday: (iso: string | null) => boolean;
  isPerfectDay: (dateStr: string) => boolean;
  currentMissions: PersonalMissionEntry[];
  allAvailableMissions: CatalogMission[];
  deleteMission: (index: number) => void;
  setShowAddMission: (b: boolean) => void;
  myGroupMissions: Mission[];
  setSelectedGroupMission: (m: Mission) => void;
  currentStreak: number;
  onProfileClick?: () => void;
  loadDay?: (dateStr: string, options?: { force?: boolean }) => Promise<void>;
}

export default function HomePage({
  userName,
  profileColor,
  weekDays,
  selectedDate,
  setSelectedDate,
  activeTab,
  setActiveTab,
  formatDate,
  isToday,
  isPerfectDay,
  currentMissions,
  allAvailableMissions,
  deleteMission,
  setShowAddMission,
  myGroupMissions,
  currentStreak,
  onProfileClick,
  loadDay,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [checkedMissions, setCheckedMissions] = React.useState<Record<number, boolean>>({});
  const [personalMissionChecked, setPersonalMissionChecked] = React.useState<Record<string, boolean>>({});
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [windowSize, setWindowSize] = React.useState({ width: 0, height: 0 });

  // 윈도우 크기 설정
  React.useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const getMissionKey = (missionEntry: PersonalMissionEntry) =>
    `${missionEntry.missionId}::${missionEntry.submission}`;

  const resolveSubmissionLabel = (missionEntry: PersonalMissionEntry) => {
    const trimmed = missionEntry.submission?.trim();
    if (trimmed) return trimmed;
    const catalog = allAvailableMissions.find((mission) => mission.id === missionEntry.missionId);
    if (catalog && catalog.submissions && catalog.submissions.length > 0) {
      // 새로운 구조: { id, label } 객체 배열
      const firstSub = catalog.submissions[0];
      if (firstSub && typeof firstSub === 'object' && 'label' in firstSub) {
        const label = (firstSub as { label: string }).label;
        if (label && typeof label === 'string' && label.trim().length > 0) {
          return label.trim();
        }
      }
    }
    if (catalog?.name) {
      return catalog.name;
    }
    return `미션-${missionEntry.missionId}`;
  };

  const handleCheck = async (id: number) => {
    if (!selectedDate) return;

    const isMyGroup = myGroupMissions.some((mission) => mission.id === id);
    if (!isMyGroup) {
      return;
    }
    
    const currentChecked = !!checkedMissions[id];
    const newChecked = !currentChecked;

    // 미션 성공 시 폭죽 효과
    if (newChecked && !currentChecked) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // 로컬 상태 먼저 업데이트 (낙관적 업데이트)
    setCheckedMissions((prev) => ({ ...prev, [id]: newChecked }));

    try {
      await groupMissionApi.checkGroupMission(id, selectedDate, newChecked);
    } catch (error) {
      // 실패 시 로컬 상태 롤백
      setCheckedMissions((prev) => ({ ...prev, [id]: currentChecked }));
      console.error("그룹 미션 체크 상태 업데이트 실패:", error);
    }
  };

  const handlePersonalMissionCheck = async (missionEntry: PersonalMissionEntry) => {
    if (!selectedDate) return;
    
    const key = getMissionKey(missionEntry);
    const currentChecked = !!personalMissionChecked[key];
    const newChecked = !currentChecked;

    // 미션 성공 시 폭죽 효과
    if (newChecked && !currentChecked) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // 로컬 상태 먼저 업데이트 (낙관적 업데이트)
    setPersonalMissionChecked((prev) => ({ ...prev, [key]: newChecked }));

    try {
      // 주간 루틴인 경우: 주간 루틴 완료 상태 저장
      // 일일 미션인 경우: 로컬 스토리지에 완료 상태 저장
      if (missionEntry.is_weekly_routine) {
        saveWeeklyRoutineCompletion(
          selectedDate,
          missionEntry.missionId,
          missionEntry.submission,
          newChecked
        );
      } else {
        const dayMissions = loadDayMissions(selectedDate);
        const missionIndex = dayMissions.findIndex(
          (m) => m.missionId === missionEntry.missionId && m.submission === missionEntry.submission
        );
        
        if (missionIndex >= 0) {
          dayMissions[missionIndex] = {
            ...dayMissions[missionIndex],
            completed: newChecked,
          };
          saveDayMissions(selectedDate, dayMissions);
        }
      }
      
      // 미션 목록 다시 불러오기
      if (loadDay && selectedDate) {
        await loadDay(selectedDate, { force: true });
      }
    } catch (error) {
      // 실패 시 로컬 상태 롤백
      setPersonalMissionChecked((prev) => ({ ...prev, [key]: currentChecked }));
      console.error("체크 상태 업데이트 실패:", error);
    }
  };

  // 날짜나 탭이 변경될 때 서버에서 불러온 completed 상태로 초기화
  React.useEffect(() => {
    if (selectedDate && activeTab === "personal") {
      const checkedState: Record<string, boolean> = {};
      currentMissions.forEach((missionEntry) => {
        const key = getMissionKey(missionEntry);
        checkedState[key] = missionEntry.completed || false;
      });
      setPersonalMissionChecked(checkedState);
    } else {
      setPersonalMissionChecked({});
    }
    
    // 그룹 미션 탭일 때 체크 상태 초기화
    if (selectedDate && activeTab === "group") {
        const checkedState: Record<number, boolean> = {};
        myGroupMissions.forEach((mission) => {
          checkedState[mission.id] = mission.checked || false;
        });
        setCheckedMissions(checkedState);
    } else if (activeTab !== "group") {
      setCheckedMissions({});
    }
  }, [selectedDate, activeTab, currentMissions, myGroupMissions]);

  return (
    <div className="page home-page">
      {/* 폭죽 효과 */}
      {showConfetti && !reducedMotion && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={48}
          gravity={0.3}
        />
      )}
      
      <header className="page-header">
        <div>
          <p className="eyebrow">나의 작은 실천</p>
          <h1>오늘도, 가볍게 초록.</h1>
          <p className="page-description">{userName || "사용자"}님, 나만의 속도로 이어가요.</p>
        </div>
        <button onClick={onProfileClick} aria-label="내 프로필 보기" className={`profile-avatar ${profileColor}`}>
          {userName ? userName.charAt(0) : "?"}
        </button>
      </header>

      <section className="routine-summary" aria-label="루틴 현황">
        <div className="summary-copy">
          <span className="summary-label"><Leaf size={16} aria-hidden="true" /> 꾸준함이 만드는 변화</span>
          <p><strong>{currentStreak}</strong><span>일째 함께하는 중</span></p>
          <span className="summary-caption">작은 습관 하나가 내일을 바꿔요.</span>
        </div>
        <div className="summary-symbol" aria-hidden="true"><Leaf size={44} strokeWidth={1.3} /></div>
      </section>

      <SegmentedControl<"personal" | "group"> label="미션 종류" value={activeTab} onChange={setActiveTab}
        options={[{ value: "personal", label: "개인 루틴" }, { value: "group", label: "그룹 미션" }]} />

      <p className="calendar-caption">{selectedDate ? formatDate() : "날짜를 선택해 주세요"}</p>
      {/* 주간 달력 */}
      <div className="week-calendar" role="group" aria-label="날짜 선택">
        {weekDays.map((day) => (
          <button
            key={day.fullDate}
            onClick={() => setSelectedDate(day.fullDate)}
            aria-pressed={selectedDate === day.fullDate}
            aria-label={`${day.fullDate}${day.isToday ? ", 오늘" : ""}${isPerfectDay(day.fullDate) ? ", 미션 모두 완료" : ""}`}
            className={`calendar-day ${
              selectedDate === day.fullDate
                ? "calendar-selected"
                : isPerfectDay(day.fullDate)
                ? "calendar-complete"
                : "calendar-idle"
            }`}
          >
            <div className="text-2xl font-bold mb-1">{day.num}</div>
            <div className="text-xs">{day.day}</div>
            {isPerfectDay(day.fullDate) && (
              <div className="absolute bottom-2 w-1.5 h-1.5 bg-green-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ===== 개인 미션 ===== */}
      {activeTab === "personal" && (
        <section className="mission-section">
          <div className="section-heading">
            <h2>{isToday(selectedDate) ? "오늘의 미션" : `${formatDate()} 미션`}</h2>
            <span className="count-pill" role="status">{currentMissions.filter(m => personalMissionChecked[getMissionKey(m)]).length} / {currentMissions.length} 완료</span>
          </div>
          {currentMissions.length > 0 ? (
            currentMissions.map((missionEntry, index) => {
              const missionKey = getMissionKey(missionEntry);
              const isChecked = !!personalMissionChecked[missionKey];
              return (
                <div
                  key={missionKey}
                  className={`mission-row ${
                    isChecked
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() =>
                        handlePersonalMissionCheck(missionEntry)
                      }
                      aria-label={`${resolveSubmissionLabel(missionEntry)} 완료`}
                      aria-pressed={isChecked}
                      className={`mission-check rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isChecked
                          ? "bg-green-700 border-green-700"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {isChecked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="white"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`text-base ${
                        isChecked
                          ? "text-green-700 line-through"
                          : "text-gray-700"
                      }`}
                    >
                      {missionEntry.submission ||
                        allAvailableMissions.find(
                          (m) => m.id === missionEntry.missionId
                        )?.name ||
                        "(삭제된 미션)"}
                    </span>
                  </div>
                  <button
                    aria-label={`${resolveSubmissionLabel(missionEntry)} 삭제`}
                    onClick={() => deleteMission(index)}
                    className="icon-button mission-delete"
                  >
                    <X size={20} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty-state"><Leaf size={28} aria-hidden="true" /><p>작은 실천부터 시작해 볼까요?</p><span>아래에서 오늘 할 미션을 골라보세요.</span></div>
          )}

          <button className="primary-button add-mission-button" onClick={() => selectedDate && setShowAddMission(true)} disabled={!selectedDate}>
            <Plus size={20} aria-hidden="true" /> 미션 추가하기
          </button>
        </section>
      )}

      {/* ===== 그룹 미션 ===== */}
      {activeTab === "group" && (
        <div className="space-y-4">
          {myGroupMissions.length > 0 ? (
            myGroupMissions.map((mission) => (
              <div
                key={mission.id}
                className="surface p-5"
              >
                {/* 상단: 그룹명 + 체크 */}
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {(() => {
                      const leader = mission.participants[0];
                      const leaderColor =
                        leader?.profile_color || mission.color || "bg-gray-300";
                      const leaderInitial = leader?.name?.charAt(0) || "G";
                      return (
                        <div
                          className={`w-12 h-12 ${leaderColor} rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow`}
                        >
                          {leaderInitial}
                        </div>
                      );
                    })()}
                    <div className="flex-1">
                      <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                        {mission.participants[0]?.name || "그룹원"} 님의 그룹
                      </p>
                      <h2 className="text-base font-bold text-gray-900 mt-1">
                        {mission.name}
                      </h2>
                      <p className="text-gray-500 text-xs mt-0.5">
                        이번주 미션 • {mission.participants.length}/3명 참여
                      </p>
                    </div>
                  </div>

                  {/* 큰 노란 체크 */}
                  <button
                    aria-label={`${mission.name} 완료`}
                    aria-pressed={!!checkedMissions[mission.id]}
                    onClick={() => handleCheck(mission.id)}
                    className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      checkedMissions[mission.id]
                        ? "border-yellow-400 bg-yellow-100 text-yellow-500 shadow-lg"
                        : "border-yellow-300 bg-white text-yellow-400 hover:bg-yellow-50"
                    }`}
                  >
                    {checkedMissions[mission.id] ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-8 h-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-yellow-300" />
                    )}
                  </button>
                </div>

                {/* 참여자 섹션 */}
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                    팀원 목록
                  </p>
                  <div className="flex justify-around items-center">
                    {mission.participants.slice(0, 3).map((participant, i) => {
                      const name = participant?.name || `멤버${i + 1}`;
                      const fallbackColors = ["bg-gray-300", "bg-gray-400", "bg-gray-500"];
                      const avatarColor =
                        participant?.profile_color || fallbackColors[i % fallbackColors.length];
                      return (
                        <div
                          key={participant?.id ?? `${mission.id}-${name}`}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className={`w-14 h-14 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow`}
                          >
                            {name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {name}
                          </span>
                        </div>
                      );
                    })}
                    {mission.participants.length === 0 && (
                      <div className="text-xs text-gray-500">팀원이 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-3xl">
              <p>참여한 그룹 미션이 없습니다</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
