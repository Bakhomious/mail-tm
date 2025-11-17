import { List, showToast, Toast, Icon, ActionPanel, Action, useNavigation } from "@raycast/api";
import { useState, useEffect } from "react";
import { getMessages } from "../api";
import { TempEmail, Message } from "../types";
import { formatMessageDate } from "../utils/formatters";
import { MessageView } from "./MessageView";

interface MailboxViewProps {
  email: TempEmail;
}

export function MailboxView({ email }: MailboxViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useNavigation();

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
            actions={
              <ActionPanel>
                <Action
                  title="View Message"
                  icon={Icon.Eye}
                  onAction={() => push(<MessageView messageId={message.id} token={email.token} />)}
                />
                <Action
                  title="Refresh"
                  icon={Icon.ArrowClockwise}
                  onAction={loadMessages}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
