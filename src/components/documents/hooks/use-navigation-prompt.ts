import { useState } from "react";
import type { NavigationPromptState } from "../types";

export function useNavigationPrompt(isDirty: boolean) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const handleNavigation = (navigationAction: () => void) => {
    if (isDirty) {
      setShowPrompt(true);
      setPendingNavigation(() => navigationAction);
    } else {
      navigationAction();
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      pendingNavigation();
    }
    setShowPrompt(false);
    setPendingNavigation(null);
  };

  const cancelNavigation = () => {
    setShowPrompt(false);
    setPendingNavigation(null);
  };

  return {
    dialogState: {
      isOpen: showPrompt,
      onConfirm: confirmNavigation,
      onCancel: cancelNavigation,
    } satisfies NavigationPromptState,
    handleNavigation,
  };
}
