// 안전한 storage wrapper (메모리 폴백)
export const safeStorage = {
  data: {} as Record<string, string>,

  async get(key: string): Promise<{ value: string } | null> {
    try {
      if (typeof window !== "undefined" && (window as any).storage) {
        const stored = await (window as any).storage.get(key, false);
        if (stored && typeof stored.value === "string") {
          this.data[key] = stored.value;
          return stored;
        }
      }
    } catch {
      // 브라우저 저장소 폴백을 이어서 시도합니다.
    }

    try {
      if (typeof window !== "undefined") {
        const value = window.localStorage.getItem(key);
        if (value !== null) {
          this.data[key] = value;
          return { value };
        }
      }
    } catch {
      // 비공개 모드 등에서 localStorage가 막히면 메모리를 사용합니다.
    }

    return Object.prototype.hasOwnProperty.call(this.data, key)
      ? { value: this.data[key] }
      : null;
  },

  async set(key: string, value: string): Promise<boolean> {
    this.data[key] = value;

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // localStorage가 막혀 있어도 메모리와 플랫폼 저장소는 계속 사용합니다.
    }

    try {
      if (typeof window !== "undefined" && (window as any).storage) {
        await (window as any).storage.set(key, value, false);
      }
    } catch {
      // 메모리/localStorage 저장이 이미 완료됐으므로 폴백 결과를 유지합니다.
    }

    return true;
  },
};

