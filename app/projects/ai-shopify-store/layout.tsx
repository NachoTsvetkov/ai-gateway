import { Chatbot } from "components/ai/chatbot";
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
      <Chatbot />
    </>
  );
}
