import type { ReactNode } from "react";
import { ErrorMessage, type ErrorMessageProps } from "../ErrorMessage/ErrorMessage";

export interface ErrorStateProps extends ErrorMessageProps {
  children?: ReactNode;
}

export function ErrorState(props: ErrorStateProps) {
  return <ErrorMessage {...props} />;
}
