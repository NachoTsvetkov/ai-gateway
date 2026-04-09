import { Chatbot } from "components/ai/chatbot";
import { DemoLauncher } from "components/ai/demo-launcher";
import { StoreNav } from "components/layout/store-nav";
import { ReactNode } from "react";

export default function StoreProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <StoreNav />
      {children}
      <DemoLauncher />
      <Chatbot />
    </>
  );
}
