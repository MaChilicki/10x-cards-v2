import { useState } from "react";
import { useNavigate } from "@/components/hooks/use-navigate";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => Promise<void>;
  onCancel?: () => void;
  dangerousHTML?: boolean;
  redirectUrl?: string;
}

const defaultState: ConfirmDialogState = {
  isOpen: false,
  title: "",
  description: "",
  confirmText: "Potwierdź",
  onConfirm: () => Promise.resolve(),
  dangerousHTML: false,
};

interface OpenDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  onCancel?: () => void;
  dangerousHTML?: boolean;
  redirectUrl?: string;
}

export function useConfirmDialog() {
  const navigate = useNavigate();
  const [dialogState, setDialogState] = useState<ConfirmDialogState>(defaultState);

  const openDialog = ({
    title,
    description,
    confirmText = "Potwierdź",
    onConfirm,
    onCancel,
    dangerousHTML = false,
    redirectUrl,
  }: OpenDialogOptions) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      confirmText,
      onConfirm,
      onCancel,
      dangerousHTML,
      redirectUrl,
    });
  };

  const closeDialog = () => {
    setDialogState(defaultState);
  };

  const handleConfirm = async () => {
    try {
      await dialogState.onConfirm();
    } finally {
      closeDialog();
    }
  };

  const handleCancel = () => {
    if (dialogState.redirectUrl) {
      navigate(dialogState.redirectUrl);
    }

    if (dialogState.onCancel) {
      dialogState.onCancel();
    }

    closeDialog();
  };

  return {
    dialogState,
    actions: {
      openDialog,
      closeDialog,
      handleConfirm,
      handleCancel,
    },
  };
}
