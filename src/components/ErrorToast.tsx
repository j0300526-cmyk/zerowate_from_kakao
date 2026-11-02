// 에러 메시지를 화면 상단에 표시하는 토스트 컴포넌트
import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  message: string;
  tone?: "error" | "success";
}

export default function ErrorToast({ message, tone = "error" }: Props) {
  if (!message) return null;
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div role="alert" className={`error-toast error-toast-${tone}`}>
      <Icon size={20} className="shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}



