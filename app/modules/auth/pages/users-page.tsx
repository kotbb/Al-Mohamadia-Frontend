"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { CreateAdminForm } from "@/app/modules/auth/components/create-admin-form";
import { UsersList } from "@/app/modules/auth/components/users-list";
import { useUsers } from "@/app/modules/auth/hooks/use-users";
import { Toast } from "@/app/modules/shared/components/toast";

export function UsersPage() {
  const t = useTranslations("users");
  const {
    users,
    listStatus,
    listError,
    refresh,
    createUsername,
    createPassword,
    setCreateUsername,
    setCreatePassword,
    isCreating,
    createError,
    toast,
    clearToast,
    submitCreate,
    togglingId,
    toggleError,
    toggleActive,
  } = useUsers();

  const toastMessage =
    toast?.kind === "created"
      ? t("createSuccess")
      : toast?.kind === "activated"
        ? t("activateSuccess")
        : toast?.kind === "deactivated"
          ? t("deactivateSuccess")
          : "";

  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <Toast
        open={toast !== null}
        message={toastMessage}
        variant={toast?.variant ?? "success"}
        onClose={clearToast}
      />

      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <CreateAdminForm
          username={createUsername}
          password={createPassword}
          onUsernameChange={setCreateUsername}
          onPasswordChange={setCreatePassword}
          isSubmitting={isCreating}
          error={createError}
          onSubmit={submitCreate}
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-text-primary">{t("listTitle")}</h2>
          <UsersList
            users={users}
            status={listStatus}
            error={listError}
            onRetry={refresh}
            togglingId={togglingId}
            toggleError={toggleError}
            onToggleActive={toggleActive}
          />
        </section>
      </div>
    </AppShell>
  );
}
