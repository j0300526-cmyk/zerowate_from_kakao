// 그룹 미션에서 나가기를 확인하는 모달
import React from "react";
import Dialog from "./Dialog";
import { Mission } from "../types";

interface Props {
  mission: Mission | null;
  onCancel: () => void;
  onConfirm: (id: number) => void;
}

export default function LeaveConfirmModal({ mission, onCancel, onConfirm }: Props) {
  const lastMission = React.useRef(mission);
  if (mission) lastMission.current = mission;
  const displayed = mission || lastMission.current;
  if (!displayed) return null;
  return (
    <Dialog open={!!mission} onClose={onCancel} title="그룹 나가기">
        <p className="text-sm text-gray-600 mb-6">"{displayed.name}" 그룹에서 나가시겠어요?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-gray-200 rounded-2xl font-medium text-gray-700">취소</button>
          <button onClick={() => onConfirm(displayed.id)} className="flex-1 py-3 bg-red-500 rounded-2xl font-medium text-white">
            나가기
          </button>
        </div>
    </Dialog>
  );
}



