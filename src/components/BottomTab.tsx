import { Leaf, Users, Send, UserRound, Trophy } from "lucide-react";
import { PageType } from "../types";

const tabs = [
  { page: "home", label: "루틴", icon: Leaf },
  { page: "groupmanage", label: "그룹", icon: Users },
  { page: "ranking", label: "랭킹", icon: Trophy },
  { page: "invite", label: "초대", icon: Send },
  { page: "mypage", label: "마이", icon: UserRound },
] as const;

export default function BottomTab({ currentPage, setCurrentPage }: {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {tabs.map(({ page, label, icon: Icon }) => (
        <button key={page} type="button" onClick={() => setCurrentPage(page)} aria-current={currentPage === page ? "page" : undefined}>
          <Icon size={22} strokeWidth={currentPage === page ? 2.2 : 1.7} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
