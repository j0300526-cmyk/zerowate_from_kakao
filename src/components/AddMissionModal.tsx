// 개인 미션을 선택하여 추가할 수 있는 모달 컴포넌트
import Dialog from "./Dialog";
import React, { useEffect, useState } from "react";
import { CatalogMission, CatalogSubMission } from "../types";

interface Props {
  visible: boolean;
  loading: boolean;
  availableMissions: CatalogMission[];
  onAdd: (selection: { missionIds: number[] }) => void | Promise<void>;
  onClose: () => void;
}

interface SelectionState {
  categoryId: number | null;
  selectedSubMissions: CatalogSubMission[];
}

export default function AddMissionModal({
  visible,
  loading,
  availableMissions,
  onAdd,
  onClose,
}: Props) {
  const [selection, setSelection] = useState<SelectionState>({
    categoryId: null,
    selectedSubMissions: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelection({ categoryId: null, selectedSubMissions: [] });
      setSubmitting(false);
    }
  }, [visible]);



  const selectedCategory = availableMissions.find((m) => m.id === selection.categoryId);
  const subMissionList = selectedCategory?.submissions || [];

  const filteredCategories = availableMissions;

  const handleCategorySelect = (categoryId: number) => {
    setSelection({ categoryId, selectedSubMissions: [] });
  };

  const handleExampleToggle = (subMission: CatalogSubMission) => {
    setSelection((prev) => {
      const alreadySelected = prev.selectedSubMissions.some((s) => s.id === subMission.id);
      const nextSubMissions = alreadySelected
        ? prev.selectedSubMissions.filter((s) => s.id !== subMission.id)
        : [...prev.selectedSubMissions, subMission];
      return { ...prev, selectedSubMissions: nextSubMissions };
    });
  };

  return (
    <Dialog open={visible} onClose={onClose} title="개인 미션 추가하기" description="꾸준히 이어갈 작은 실천을 골라보세요.">

        {/* 대주제 선택 (1단계) */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            1. 실천 주제
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category.id}
                  aria-pressed={selection.categoryId === category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition ${
                    selection.categoryId === category.id
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-200"
                  }`}
                >
                  <div className="font-bold text-gray-800">{category.category}</div>
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </div>

        {/* 소주제 선택 (2단계) */}
        {selectedCategory && subMissionList.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              2. 실천할 미션
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {subMissionList.map((subMission) => {
                const isSelected = selection.selectedSubMissions.some((s) => s.id === subMission.id);
                return (
                  <button
                    key={subMission.id}
                    aria-pressed={isSelected}
                    onClick={() => handleExampleToggle(subMission)}
                    className={`w-full text-left p-3 rounded-2xl border-2 transition ${
                      isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-gray-800">
                      <span>{subMission.label}</span>
                      {isSelected && (
                        <span className="text-xs text-green-700 font-semibold">선택됨</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="dialog-action dialog-action-secondary"
          >
            취소
          </button>
          <button
            onClick={async () => {
              if (selection.categoryId && selection.selectedSubMissions.length > 0) {
                setSubmitting(true);
                try {
                  await onAdd({
                    missionIds: selection.selectedSubMissions.map((s) => s.id),
                  });
                } finally {
                  setSubmitting(false);
                }
              }
            }}
            disabled={
              !selection.categoryId || selection.selectedSubMissions.length === 0 || loading || submitting
            }
            className="dialog-action dialog-action-primary"
          >
            {loading
              ? "불러오는 중…"
              : submitting
                ? "추가 중…"
                : selection.selectedSubMissions.length
                  ? `${selection.selectedSubMissions.length}개 추가하기`
                  : "미션 추가하기"}
          </button>
        </div>
    </Dialog>
  );
}



