export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "alert" | "success" | "info" | "warning";
}
