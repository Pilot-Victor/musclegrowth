import { useEffect, useRef } from "react";
import { graniteEvent } from "@apps-in-toss/web-framework";

// 활성화된 백핸들러 스택. 뒤로가기 시 가장 최근(top) 핸들러 하나만 실행해요.
const handlerStack: Array<() => void> = [];
let unsubscribe: (() => void) | null = null;

function syncListener() {
  if (handlerStack.length > 0 && unsubscribe == null) {
    // 활성 핸들러가 생기면 안드로이드/네비바 뒤로가기를 가로채요.
    // graniteEvent 는 앱인토스 네이티브 환경에서만 동작하고,
    // 일반 브라우저(개발용 미리보기 등)에서는 에러를 던지므로 안전하게 감싸요.
    try {
      unsubscribe = graniteEvent.addEventListener("backEvent", {
        onEvent: () => {
          const top = handlerStack[handlerStack.length - 1];
          top?.();
        },
      });
    } catch {
      unsubscribe = null; // 앱인토스 환경이 아니면 무시(브라우저 등)
    }
  } else if (handlerStack.length === 0 && unsubscribe != null) {
    // 활성 핸들러가 없으면 리스너를 제거해 기본 뒤로가기(이전 화면/앱 종료)를 복원해요.
    try {
      unsubscribe();
    } catch {
      /* noop */
    }
    unsubscribe = null;
  }
}

/**
 * active 동안 안드로이드/네비게이션 바 뒤로가기를 가로채 onBack 을 실행해요.
 * 여러 오버레이가 겹쳐도 가장 최근에 활성화된 것 하나만 처리해요(스택).
 * 활성 핸들러가 하나도 없으면 기본 뒤로가기(앱 종료 등)가 그대로 동작해요.
 *
 * TDS BottomSheet/Dialog 는 자체적으로 backEvent 를 처리하므로 이 훅이 필요 없어요.
 * 직접 만든 풀스크린 오버레이(예: 음식 추가 화면)나 다단계 화면(온보딩)에만 쓰세요.
 */
export function useBackHandler(active: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!active) return;
    const handler = () => onBackRef.current();
    handlerStack.push(handler);
    syncListener();
    return () => {
      const i = handlerStack.lastIndexOf(handler);
      if (i !== -1) handlerStack.splice(i, 1);
      syncListener();
    };
  }, [active]);
}
