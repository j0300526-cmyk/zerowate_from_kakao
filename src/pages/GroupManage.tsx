import React from "react";
import Dialog from "../components/Dialog";
import { Mission } from "../types";
import { Plus } from "lucide-react";

interface Props {
  myGroupMissions: Mission[];
  recommendedMissions: Mission[];
  isInMyGroups: (id: number) => boolean;
  joinGroup: (m: Mission) => void;
  setSelectedGroupMission: (m: Mission) => void;
  setLeaveTarget: (m: Mission) => void;
  onCreateGroup?: (name: string, color: string) => Promise<void>;
  onDeleteGroup?: (id: number) => Promise<void>;
  currentUserId?: number;
}

export default function GroupManagePage({
  myGroupMissions,
  recommendedMissions,
  isInMyGroups,
  joinGroup,
  setSelectedGroupMission,
  setLeaveTarget,
  onCreateGroup,
  onDeleteGroup,
  currentUserId
}: Props) {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState("bg-blue-300");
  const [isCreating, setIsCreating] = React.useState(false);

  const colors = [
    "bg-blue-300",
    "bg-green-300",
    "bg-purple-300",
    "bg-pink-300",
    "bg-yellow-300",
    "bg-orange-300",
  ];

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !onCreateGroup) return;
    
    setIsCreating(true);
    try {
      await onCreateGroup(groupName.trim(), selectedColor);
      setShowCreateModal(false);
      setGroupName("");
      setSelectedColor("bg-blue-300");
    } catch (error) {
      console.error("그룹 생성 실패:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header group-page-header">
        <div><p className="eyebrow">함께하면 더 오래</p><h1>우리의 초록 습관</h1><p className="page-description">서로의 실천을 응원하는 작은 모임.</p></div>
        {onCreateGroup && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="primary-button"
          >
            <Plus size={18} />
            그룹 만들기
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">참여 중인 그룹</h3>
          <span className="text-sm text-gray-500">{myGroupMissions.length}개</span>
        </div>

        <div className="space-y-3">
          {myGroupMissions.length === 0 && <div className="empty-state"><p>아직 참여 중인 그룹이 없어요.</p><span>새 그룹을 만들거나 추천 그룹에 참여해 보세요.</span></div>}
          {myGroupMissions.map((mission) => {
            const isOwner = currentUserId !== undefined && mission.created_by === currentUserId;
            return (
              <div key={mission.id} className="surface p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${mission.color} rounded-full`} />
                    <div>
                      <h4 className="font-bold text-gray-800">{mission.name}</h4>
                      <p className="text-sm text-gray-500">
                        {mission.participants.length}/3명 참여중
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGroupMission(mission)}
                    className="flex-1 py-2 bg-white rounded-3xl text-sm text-gray-600 border border-gray-200"
                  >
                    참여자 보기
                  </button>
                  {isOwner && onDeleteGroup ? (
                    <button
                      onClick={() => onDeleteGroup(mission.id)}
                      className="flex-1 py-2 bg-red-500 rounded-3xl text-sm text-white hover:bg-red-600 transition-colors"
                    >
                      삭제하기
                    </button>
                  ) : (
                    <button
                      onClick={() => setLeaveTarget(mission)}
                      className="flex-1 py-2 bg-red-50 rounded-3xl text-sm text-red-500"
                    >
                      나가기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">추천 그룹 미션</h3>
        <div className="space-y-3">
          {recommendedMissions.map((m) => (
            <div key={m.id} className="surface p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${m.color} rounded-full`} />
                <div>
                  <h4 className="font-bold text-gray-800">{m.name}</h4>
                  <p className="text-sm text-gray-500">{m.participants.length}/3명 참여중</p>
                </div>
              </div>
              <button
                disabled={isInMyGroups(m.id) || m.participants.length >= 3}
                onClick={() => joinGroup(m)}
                className={`w-full py-2 rounded-3xl text-sm font-medium border ${
                  isInMyGroups(m.id)
                    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                    : m.participants.length >= 3
                    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                    : "bg-white text-green-600 border-gray-200 hover:bg-green-50"
                }`}
              >
                {isInMyGroups(m.id) ? "참여중" : m.participants.length >= 3 ? "인원 마감" : "참여하기"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 그룹 생성 모달 */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} title="새 그룹 만들기" description="함께 실천할 모임에 이름을 붙여주세요.">
            <div className="mb-4">
              <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-2">
                그룹 이름
              </label>
              <input
                id="group-name"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="예: 텀블러 챌린지"
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={30}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                그룹 색상
              </label>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color, index) => (
                  <button
                    key={color}
                    aria-label={`${["파랑", "초록", "보라", "분홍", "노랑", "주황"][index]} 그룹 색상`}
                    aria-pressed={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 ${color} rounded-full border-4 transition-all ${
                      selectedColor === color
                        ? "border-gray-800 scale-110"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-gray-200 rounded-2xl font-medium text-gray-700"
                disabled={isCreating}
              >
                취소
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || isCreating}
                className={`flex-1 py-3 rounded-2xl font-medium text-white ${
                  !groupName.trim() || isCreating
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {isCreating ? "생성 중..." : "만들기"}
              </button>
            </div>
      </Dialog>
    </div>
  );
}

