import { List, showToast, Toast, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { getMessages } from "../api";
import { TempEmail, Message } from "../types";
import { formatMessageDate } from "../utils/formatters";
import { MessageActionsPanel, MessageDetailContent } from "./MessageDetailContent";

interface MailboxViewProps {
  email: TempEmail;
}

export function MailboxView({ email }: MailboxViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  async function loadMessages() {
    setIsLoading(true);
    try {
      const response = await getMessages(email.token);
      setMessages(response["hydra:member"]);
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load messages",
        message: error instanceof Error ? error.message : "Unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <List
      isLoading={isLoading}
      navigationTitle={email.address}
      isShowingDetail={messages.length > 0}
      onSelectionChange={(id) => {
        if (id) setSelectedMessageId(id);
      }}
    >
      {messages.length === 0 ? (
        <List.EmptyView
          title="No messages"
          description="Your mailbox is empty"
          icon={Icon.Envelope}
        />
      ) : (
        messages.map((message) => (
          <List.Item
            key={message.id}
            id={message.id}
            title={message.subject || "(No Subject)"}
            subtitle={message.from.address}
            accessories={[
              { text: formatMessageDate(message.createdAt) },
              ...(!message.seen ? [{ icon: Icon.Circle, tooltip: "Unread" }] : [])
            ]}
            detail={
              <MessageDetailContent messageId={message.id} token={email.token} message={message} />
            }
            actions={
              <MessageActionsPanel message={message} token={email.token} onRefresh={loadMessages} />
            }
          />
        ))
      )}
    </List>
  );
}
