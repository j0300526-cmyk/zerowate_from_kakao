// 에러 메시지를 화면 상단에 표시하는 토스트 컴포넌트
import React from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  message: string;
}

export default function ErrorToast({ message }: Props) {
  if (!message) return null;
  return (
    <div role="alert" className="error-toast">
      <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}



