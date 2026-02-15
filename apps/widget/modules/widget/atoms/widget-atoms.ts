import { atom } from "jotai";
import { WidgetScreen } from "@/modules/widget/types";

// Basic widget state atom
export const screenAtom = atom<WidgetScreen>("auth");
