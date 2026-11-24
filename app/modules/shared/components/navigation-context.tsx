"use client";
import { createContext } from "react";
import type { AppNavigation } from "../types/navigation.types";
export const NavigationContext = createContext<AppNavigation | null>(null);
