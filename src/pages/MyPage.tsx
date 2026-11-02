import React from "react";
import Dialog from "../components/Dialog";
import ProfileAvatar, { AVATAR_OPTIONS, isAvatarId } from "../components/ProfileAvatar";
import {
  ArrowLeft,
  Bell,
  Check,
  Crown,
  Database,
  Flame,
  Leaf,
  Recycle,
  Settings,
  Sprout,
  Trophy,
  User,
} from "lucide-react";

interface Props {
  userName: string;
  totalMissionsCount: number;
  currentStreak: number;
  profileColor: string;
  profileAvatar: string;
  userBio: string;
  onSaveProfile: (name: string, color: string, bio: string, avatar: string) => Promise<boolean>;
}


export default function MyPage({
  userName: initialUserName,
  totalMissionsCount,
  currentStreak,
  profileColor: initialColor,
  profileAvatar: initialAvatar,
  userBio: initialBio,
  onSaveProfile,
}: Props) {
  const [currentPage, setCurrentPage] = React.useState("mypage");
  const [showSettings, setShowSettings] = React.useState(false);

  // ProfileEdit 상태
  const [userName, setUserName] = React.useState(initialUserName || "사용자");
  const [profileColor, setProfileColor] = React.useState(initialColor || "bg-green-300");
  const [profileAvatar, setProfileAvatar] = React.useState(
    isAvatarId(initialAvatar) ? initialAvatar : "sprout"
  );
  const [bio, setBio] = React.useState(initialBio || "친환경 실천 중!");
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedMessage, setSavedMessage] = React.useState("");

  const colors = [
    "bg-green-300",
    "bg-blue-300",
    "bg-purple-300",
    "bg-pink-300",
    "bg-yellow-300",
    "bg-red-300",
    "bg-indigo-300",
    "bg-cyan-300",
  ];

  const rewards = [
    {
      id: "eco-sprout",
      name: "에코 새싹",
      description: "제로웨이스트 여정 시작",
      icon: Sprout,
      unlocked: true,
      iconClass: "bg-emerald-100 text-emerald-600",
      cardClass: "border-emerald-200 bg-emerald-50/70",
    },
    {
      id: "first-step",
      name: "첫 실천",
      description: "미션 1개 완료",
      icon: Leaf,
      unlocked: totalMissionsCount >= 1,
      iconClass: "bg-lime-100 text-lime-600",
      cardClass: "border-lime-200 bg-lime-50/70",
    },
    {
      id: "routine-starter",
      name: "루틴 스타터",
      description: "3일 연속 달성",
      icon: Flame,
      unlocked: currentStreak >= 3,
      iconClass: "bg-orange-100 text-orange-500",
      cardClass: "border-orange-200 bg-orange-50/70",
    },
    {
      id: "green-maker",
      name: "그린 메이커",
      description: "미션 10개 완료",
      icon: Recycle,
      unlocked: totalMissionsCount >= 10,
      iconClass: "bg-teal-100 text-teal-600",
      cardClass: "border-teal-200 bg-teal-50/70",
    },
    {
      id: "weekly-champion",
      name: "위클리 챔피언",
      description: "7일 연속 달성",
      icon: Trophy,
      unlocked: currentStreak >= 7,
      iconClass: "bg-amber-100 text-amber-600",
      cardClass: "border-amber-200 bg-amber-50/70",
    },
    {
      id: "zero-hero",
      name: "제로 히어로",
      description: "미션 30개 · 14일 연속",
      icon: Crown,
      unlocked: totalMissionsCount >= 30 && currentStreak >= 14,
      iconClass: "bg-violet-100 text-violet-600",
      cardClass: "border-violet-200 bg-violet-50/70",
    },
  ];

  const unlockedRewardCount = rewards.filter((reward) => reward.unlocked).length;

  const handleEditProfile = () => {
    setShowSettings(false);
    setCurrentPage("edit");
  };

  const handleSave = async () => {
    if (isSaving || !userName.trim()) return;
    setIsSaving(true);
    try {
      const saved = await onSaveProfile(userName.trim(), profileColor, bio, profileAvatar);
      if (saved) {
        setSavedMessage("프로필을 저장했어요.");
        setCurrentPage("mypage");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // MyPage 렌더
  if (currentPage === "mypage") {
    return (
      <div className="page">
        <div className="page-header">
          <div><p className="eyebrow">차곡차곡 쌓이는 기록</p><h1>마이페이지</h1></div>
          <button
            aria-label="설정 열기"
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Settings size={24} className="text-gray-600" />
          </button>
        </div>

        {savedMessage && <p role="status" className="save-feedback">{savedMessage}</p>}
        <div className="surface profile-card flex flex-col items-center mb-6">
          <ProfileAvatar
            avatar={profileAvatar}
            color={profileColor}
            size="lg"
            className="mb-4"
            label={`${userName || "사용자"}님의 ${AVATAR_OPTIONS.find((option) => option.id === profileAvatar)?.label} 프로필`}
          />
          <h3 className="text-xl font-bold mb-2">{userName || "사용자"}</h3>
          <p className="text-gray-500 text-sm">{bio}</p>
        </div>

        <div className="space-y-4">
          <div className="surface p-5">
            <h4 className="font-bold mb-3">내 통계</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">총 미션 수행</span>
                <span className="font-bold text-green-500">{totalMissionsCount}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연속 달성</span>
                <span className="font-bold text-orange-400">{currentStreak}일</span>
              </div>
            </div>
          </div>

          <div className="surface p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold">내 리워드</h4>
                <p className="text-xs text-gray-500 mt-1">작은 실천이 모여 뱃지가 돼요</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-600 shadow-sm">
                {unlockedRewardCount}/{rewards.length} 획득
              </span>
            </div>
            <div className="reward-grid">
              {rewards.map((reward) => {
                const Icon = reward.icon;
                return (
                  <div
                    key={reward.id}
                    className={`relative min-h-36 rounded-2xl border p-3 transition ${
                      reward.unlocked
                        ? reward.cardClass
                        : "border-gray-200 bg-white opacity-55 grayscale"
                    }`}
                  >
                    {reward.unlocked && (
                      <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                    <div
                      className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${
                        reward.unlocked ? reward.iconClass : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon size={24} strokeWidth={2.2} />
                    </div>
                    <p className="text-sm font-bold text-gray-800">{reward.name}</p>
                    <p className="mt-1 text-[11px] leading-4 text-gray-500">
                      {reward.description}
                    </p>
                    <span
                      className={`mt-3 inline-block text-[10px] font-bold ${
                        reward.unlocked ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {reward.unlocked ? "획득 완료" : "아직 잠겨 있어요"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              미션을 완료하고 연속 기록을 이어가 보세요
            </p>
          </div>
        </div>

        {/* 설정 모달 */}
        <Dialog open={showSettings} onClose={() => setShowSettings(false)} title="설정">
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleEditProfile}
                  className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">프로필 편집</div>
                    <div className="text-xs text-gray-500">닉네임, 소개, 프로필 캐릭터 변경</div>
                  </div>
                </button>

                <div className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Bell size={20} className="text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">알림 설정</div>
                    <div className="text-xs text-gray-500">알림 설정은 준비 중이에요</div>
                  </div>
                </div>

                <div className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Database size={20} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">데모 데이터 안내</div>
                    <div className="text-xs text-gray-500">데모 기록은 일정 시간 후 초기화될 수 있어요</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 rounded-3xl bg-gray-100 text-gray-800 font-medium mt-3 hover:bg-gray-200 transition"
              >
                닫기
              </button>
        </Dialog>
      </div>
    );
  }

  // ProfileEdit 렌더
  if (currentPage === "edit") {
    return (
      <div className="page">
        <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-200">
          <button
            aria-label="마이페이지로 돌아가기"
            onClick={() => setCurrentPage("mypage")}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold">프로필 편집</h2>
        </div>

        <div className="px-6 py-6">
          <div className="profile-preview">
            <ProfileAvatar
              avatar={profileAvatar}
              color={profileColor}
              size="xl"
              label={`선택한 ${AVATAR_OPTIONS.find((option) => option.id === profileAvatar)?.label} 프로필 미리보기`}
            />
            <div>
              <p className="font-bold text-gray-800">내 프로필 미리보기</p>
              <p className="text-sm text-gray-500 mt-1">캐릭터와 배경색을 골라보세요.</p>
            </div>
          </div>

          <fieldset className="mb-8">
            <legend className="font-bold text-gray-800 mb-3">프로필 캐릭터</legend>
            <div className="avatar-picker">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-label={`${option.label} 캐릭터 선택`}
                  aria-pressed={profileAvatar === option.id}
                  onClick={() => setProfileAvatar(option.id)}
                  className="avatar-option"
                >
                  <ProfileAvatar avatar={option.id} color={profileColor} size="sm" />
                  <span>{option.label}</span>
                  {profileAvatar === option.id && (
                    <span className="avatar-option-check" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-3">배경색</h3>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color, index) => (
                <button
                  key={color}
                  aria-label={`${["초록", "파랑", "보라", "분홍", "노랑", "빨강", "남색", "하늘색"][index]} 프로필 색상`}
                  aria-pressed={profileColor === color}
                  onClick={() => setProfileColor(color)}
                  className={`profile-color-option ${color}`}
                />
              ))}
            </div>
          </div>

          {/* 닉네임 입력 */}
          <div className="mb-6">
            <label htmlFor="profile-name" className="block font-bold text-gray-800 mb-2">닉네임</label>
            <input id="profile-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value.slice(0, 15))}
              maxLength={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-300 transition"
              placeholder="닉네임을 입력하세요"
            />
            <p className="text-xs text-gray-500 mt-1">{userName.length}/15</p>
          </div>

          {/* 소개 입력 */}
          <div className="mb-8">
            <label htmlFor="profile-bio" className="block font-bold text-gray-800 mb-2">소개</label>
            <textarea id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 50))}
              maxLength={50}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-300 transition resize-none"
              placeholder="자신을 소개해주세요"
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/50</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage("mypage")}
              className="flex-1 py-3 rounded-3xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !userName.trim()}
              className={`flex-1 py-3 rounded-3xl font-medium text-white transition ${
                isSaving
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              }`}
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

