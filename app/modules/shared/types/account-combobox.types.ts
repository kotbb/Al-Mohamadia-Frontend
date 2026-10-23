export interface AccountOption { id: string; name: string; isActive: boolean; isDeleted?: boolean; }

export interface AccountComboboxLabels { label: string; placeholder: string; clear: string; loading: string; empty: string; }

export interface AccountComboboxProps<T extends AccountOption> {
  name: string;
  labels: AccountComboboxLabels;
  originalAccount?: T | null;
  query: string;
  onQueryChange: (value: string) => void;
  results: T[];
  loading: boolean;
  allAccounts: T[];
  allAccountsLoading: boolean;
  selectedAccount: T | null;
  onSelect: (account: T) => void;
  onClear: () => void;
  focusOnMount?: boolean;
}

