"use client";

import { useAtomValue } from "jotai";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { screenAtom } from "@/modules/widget/atoms/widget-atoms";

interface Probs {
    organizationId: string;
};

export const WidgetView = ({ organizationId }: Probs) => {
    const screen = useAtomValue(screenAtom);

    const screenComponents = {
        error: <p>Something went wrong</p>,
        loading: <p>Loading...</p>,
        auth: <WidgetAuthScreen />,
        voice: <p>Voice Screen</p>,
        inbox: <p>Inbox Screen</p>,
        selection: <p>Selection Screen</p>,
        chat: <p>Chat Screen</p>,
        contact: <p>Contact Screen</p>,
    }

    return (
        <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
            {screenComponents[screen]}
        </main>
    );
};