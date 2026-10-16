export interface UseLoginResult {
  username: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  isSubmitting: boolean;
  rateLimitSecondsLeft: number;
  errorMessage: string | null;
  submit: () => Promise<void>;
}
