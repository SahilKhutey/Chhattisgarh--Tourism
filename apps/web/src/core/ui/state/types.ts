export type UIState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "offline"
  | "unauthorized"
  | "forbidden"
  | "not-found";

export type AsyncUIState<T> =
  | {
      status: "idle";
    }
  | {
      status: "loading";
      previousData?: T;
    }
  | {
      status: "success";
      data: T;
    }
  | {
      status: "empty";
    }
  | {
      status: "error";
      error: Error;
    }
  | {
      status: "offline";
      previousData?: T;
    };
