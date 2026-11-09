import React, { createContext, useContext, useState, useCallback } from "react";
import { CustomAlertDialog, AlertButton } from "@/components/ui/CustomAlertDialog";
import { CustomBottomSheet, BottomSheetAction } from "@/components/ui/CustomBottomSheet";
import { CustomToast, ToastType } from "@/components/ui/CustomToast";

export interface AlertOptions {
  title: string;
  description?: string;
  icon?: string;
  iconType?: "feather" | "material";
  type?: "danger" | "warning" | "info" | "success" | "purple";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
  buttons?: AlertButton[];
  dismissable?: boolean;
}

export interface BottomSheetOptions {
  title?: string;
  description?: string;
  headerIcon?: string;
  headerIconType?: "feather" | "material";
  headerIconColor?: string;
  headerIconBg?: string;
  actions: BottomSheetAction[];
  showDragHandle?: boolean;
  showCloseButton?: boolean;
  cancelButtonText?: string;
}

export interface ToastOptions {
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  position?: "top" | "bottom";
}

interface ModalContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  showBottomSheet: (options: BottomSheetOptions) => void;
  hideBottomSheet: () => void;
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  hideToast: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

// Singleton modal service for imperative calls
export const modalService: {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  showBottomSheet: (options: BottomSheetOptions) => void;
  hideBottomSheet: () => void;
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  hideToast: () => void;
} = {
  showAlert: () => {},
  hideAlert: () => {},
  showBottomSheet: () => {},
  hideBottomSheet: () => {},
  showToast: () => {},
  hideToast: () => {},
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Alert State
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    options: AlertOptions;
  }>({
    visible: false,
    options: { title: "" },
  });

  // BottomSheet State
  const [sheetState, setSheetState] = useState<{
    visible: boolean;
    options: BottomSheetOptions;
  }>({
    visible: false,
    options: { actions: [] },
  });

  // Toast State
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    title?: string;
    type: ToastType;
    duration: number;
    position: "top" | "bottom";
  }>({
    visible: false,
    message: "",
    type: "info",
    duration: 3200,
    position: "top",
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      visible: true,
      options,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showBottomSheet = useCallback((options: BottomSheetOptions) => {
    setSheetState({
      visible: true,
      options,
    });
  }, []);

  const hideBottomSheet = useCallback(() => {
    setSheetState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration: number = 3200) => {
      setToastState({
        visible: true,
        message,
        title,
        type,
        duration,
        position: "top",
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, visible: false }));
  }, []);

  // Sync singleton modalService
  modalService.showAlert = showAlert;
  modalService.hideAlert = hideAlert;
  modalService.showBottomSheet = showBottomSheet;
  modalService.hideBottomSheet = hideBottomSheet;
  modalService.showToast = showToast;
  modalService.hideToast = hideToast;

  return (
    <ModalContext.Provider
      value={{
        showAlert,
        hideAlert,
        showBottomSheet,
        hideBottomSheet,
        showToast,
        hideToast,
      }}
    >
      {children}

      {/* Global Alert Dialog */}
      <CustomAlertDialog
        visible={alertState.visible}
        onClose={hideAlert}
        title={alertState.options.title}
        description={alertState.options.description}
        icon={alertState.options.icon}
        iconType={alertState.options.iconType}
        type={alertState.options.type}
        confirmText={alertState.options.confirmText}
        cancelText={alertState.options.cancelText}
        onConfirm={alertState.options.onConfirm}
        onCancel={alertState.options.onCancel}
        isDestructive={alertState.options.isDestructive}
        buttons={alertState.options.buttons}
        dismissable={alertState.options.dismissable}
      />

      {/* Global Bottom Sheet */}
      <CustomBottomSheet
        visible={sheetState.visible}
        onClose={hideBottomSheet}
        title={sheetState.options.title}
        description={sheetState.options.description}
        headerIcon={sheetState.options.headerIcon}
        headerIconType={sheetState.options.headerIconType}
        headerIconColor={sheetState.options.headerIconColor}
        headerIconBg={sheetState.options.headerIconBg}
        actions={sheetState.options.actions}
        showDragHandle={sheetState.options.showDragHandle}
        showCloseButton={sheetState.options.showCloseButton}
        cancelButtonText={sheetState.options.cancelButtonText}
      />

      {/* Global Toast */}
      <CustomToast
        visible={toastState.visible}
        message={toastState.message}
        title={toastState.title}
        type={toastState.type}
        duration={toastState.duration}
        position={toastState.position}
        onDismiss={hideToast}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    return {
      showAlert: modalService.showAlert,
      hideAlert: modalService.hideAlert,
      showBottomSheet: modalService.showBottomSheet,
      hideBottomSheet: modalService.hideBottomSheet,
      showToast: modalService.showToast,
      hideToast: modalService.hideToast,
    };
  }
  return context;
};

export default ModalContext;
