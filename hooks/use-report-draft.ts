import { useEffect, useRef, useState } from "react";
import {
  ReportDraft,
  acknowledgeUncertainSubmit,
  beginDraftSubmit,
  createDraft,
  draftAfterEdit,
  failDraftSubmit,
  reportDraftStorageKey,
  restoredDraftNotice,
} from "@/libs/report-draft";
import {
  readReportDraft,
  removeReportDraft,
  writeReportDraft,
} from "@/libs/report-draft-store";

function newAttemptId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useReportDraft<T extends object>(options: {
  kind: "create" | "edit";
  rosterId: string;
  ownerStaffId?: number | null;
  ownerCompanyId?: number | null;
  form: T;
  setForm: (form: T) => void;
  serverForm?: T | null;
  hasLocalEdits?: { current: boolean };
}) {
  const {
    kind,
    rosterId,
    ownerStaffId,
    ownerCompanyId,
    form,
    setForm,
    serverForm = null,
    hasLocalEdits,
  } = options;
  const key = reportDraftStorageKey(kind, rosterId, {
    staffId: ownerStaffId,
    companyId: ownerCompanyId,
  });
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsAcknowledge, setNeedsAcknowledge] = useState(false);
  const draftRef = useRef<ReportDraft<T> | null>(null);
  const readyRef = useRef(false);
  const hydratedKey = useRef<string | null>(null);
  const attemptRef = useRef(newAttemptId());
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    if (!key) {
      hydratedKey.current = null;
      if (kind === "edit" && !serverForm) return;
      if (serverForm && !hasLocalEdits?.current) {
        setForm(serverForm);
      }
      draftRef.current = createDraft(
        rosterId,
        serverForm && !hasLocalEdits?.current ? serverForm : formRef.current,
        new Date(),
        attemptRef.current
      );
      readyRef.current = true;
      setReady(true);
      return;
    }

    if (hydratedKey.current === key) return;
    if (kind === "edit" && !serverForm) return;

    let cancelled = false;
    void (async () => {
      const stored = await readReportDraft<T>(key);
      if (cancelled || hydratedKey.current === key) return;

      if (stored && stored.rosterId === rosterId) {
        if (!hasLocalEdits?.current) {
          setForm(stored.form);
        }
        const restored = hasLocalEdits?.current
          ? { ...stored, form: formRef.current }
          : stored;
        draftRef.current = restored;
        setNotice(restoredDraftNotice(stored));
        setNeedsAcknowledge(stored.submitState === "in_flight");
      } else if (serverForm) {
        setForm(serverForm);
        draftRef.current = createDraft(
          rosterId,
          serverForm,
          new Date(),
          attemptRef.current
        );
      } else {
        draftRef.current = createDraft(
          rosterId,
          formRef.current,
          new Date(),
          attemptRef.current
        );
      }

      hydratedKey.current = key;
      readyRef.current = true;
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [key, kind, rosterId, serverForm, setForm]);

  useEffect(() => {
    if (!key) return;
    if (!readyRef.current) return;
    if (
      !hasLocalEdits?.current &&
      draftRef.current?.submitState !== "in_flight" &&
      draftRef.current?.submitState !== "failed"
    ) {
      return;
    }
    const next = draftAfterEdit(
      draftRef.current,
      rosterId,
      form,
      new Date(),
      attemptRef.current
    );
    draftRef.current = next;
    const timer = setTimeout(() => {
      void writeReportDraft(key, next);
    }, 250);
    return () => clearTimeout(timer);
  }, [form, key, rosterId]);

  const acknowledge = async () => {
    const current = draftRef.current;
    if (!current) return;
    const next = acknowledgeUncertainSubmit(current, new Date());
    draftRef.current = next;
    setNeedsAcknowledge(false);
    setNotice(
      "Send again only if this report is not already in your report list."
    );
    if (key) await writeReportDraft(key, next);
  };

  const prepareSubmit = async (): Promise<boolean> => {
    if (!key) {
      setNotice(
        "This report was not sent. Your sign-in has no company id for a draft on this device."
      );
      return false;
    }

    const current =
      draftRef.current ??
      createDraft(rosterId, form, new Date(), attemptRef.current);
    if (needsAcknowledge || current.submitState === "in_flight") {
      setNotice(restoredDraftNotice({ ...current, submitState: "in_flight" }));
      setNeedsAcknowledge(true);
      return false;
    }

    const begun = beginDraftSubmit(current, new Date(), attemptRef.current);
    if (!begun.ok) {
      setNeedsAcknowledge(true);
      setNotice(restoredDraftNotice({ ...current, submitState: "in_flight" }));
      return false;
    }

    draftRef.current = begun.draft;
    const stored = await writeReportDraft(key, begun.draft);
    if (!stored) {
      setNeedsAcknowledge(true);
      setNotice(restoredDraftNotice(begun.draft));
      return false;
    }
    return true;
  };

  const markFailed = async () => {
    const current = draftRef.current;
    if (!current) return;
    const next = failDraftSubmit(current, new Date());
    draftRef.current = next;
    setNeedsAcknowledge(false);
    if (key) await writeReportDraft(key, next);
  };

  const markSaved = async () => {
    draftRef.current = null;
    setNotice(null);
    setNeedsAcknowledge(false);
    if (key) await removeReportDraft(key);
  };

  return {
    ready,
    notice,
    needsAcknowledge,
    acknowledge,
    prepareSubmit,
    markFailed,
    markSaved,
  };
}
