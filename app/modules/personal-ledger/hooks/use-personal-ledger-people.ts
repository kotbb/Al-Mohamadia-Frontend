"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { listCustomers } from "@/app/modules/customers/services/customers.service";
import { listPersonalLedgerContacts } from "../services/personal-ledger.service";
import type { LedgerPersonOption } from "../types/personal-ledger.types";
import { usePersonalLedgerResource } from "./use-personal-ledger-resource";

export function usePersonalLedgerPeople() {
  const t = useTranslations("personalLedger");
  const [query, setQuery] = useState("");
  const load = useCallback(async (signal: AbortSignal) => {
    const [contacts, customers] = await Promise.all([
      listPersonalLedgerContacts({ q: query, includeInactive: true, limit: 30 }, signal),
      listCustomers({ q: query, isActive: true, limit: 30 }, signal),
    ]);
    const linked = new Set(contacts.items.map((person) => person.customerId).filter(Boolean));
    const people: LedgerPersonOption[] = contacts.items.filter((person) => person.isActive).map((person) => ({
      id: `contact:${person.id}`, referenceId: person.id, source: "contact", name: `${person.name} (${t("personalContact")})`, isActive: true,
    }));
    for (const customer of customers.items) {
      if (!linked.has(customer.id)) people.push({ id: `customer:${customer.id}`, referenceId: customer.id, source: "customer", name: `${customer.name} (${t("storeCustomer")})`, isActive: true });
    }
    return people;
  }, [query, t]);
  const resource = usePersonalLedgerResource(load, 250);

  return { query, setQuery, resource };
}
