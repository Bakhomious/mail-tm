import { List, showToast, Toast, Icon, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import { getMessageDetail } from "../api";
import { Message, MessageDetail } from "../types";
import { formatFullDate } from "../utils/formatters";

interface MessageActionsPanelProps {
  message: Message;
  token: string;
  onRefresh: () => void;
}

export function MessageActionsPanel({ message, token, onRefresh }: MessageActionsPanelProps) {
  const [messageDetail, setMessageDetail] = useState<MessageDetail | null>(null);

  useEffect(() => {
    async function loadMessageDetail() {
      try {
        const detail = await getMessageDetail(message.id, token);
        setMessageDetail(detail);
      } catch (error) {
        console.error(error);
      }
    }
    loadMessageDetail();
  }, [message.id]);

  return (
    <ActionPanel>
      <Action
        title="Refresh"
        icon={Icon.ArrowClockwise}
        onAction={onRefresh}
        shortcut={{ modifiers: ["cmd"], key: "r" }}
      />
      {messageDetail && (
        <ActionPanel.Section title="Copy">
          <Action.CopyToClipboard
            title="Copy Message Text"
            content={messageDetail.text || ""}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action.CopyToClipboard
            title="Copy Sender Email"
            content={messageDetail.from.address}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
        </ActionPanel.Section>
      )}
    </ActionPanel>
  );
}

interface MessageDetailContentProps {
  messageId: string;
  token: string;
  message: Message;
}

export function MessageDetailContent({ messageId, token }: MessageDetailContentProps) {
  const [messageDetail, setMessageDetail] = useState<MessageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadMessageDetail() {
    setIsLoading(true);
    try {
      const detail = await getMessageDetail(messageId, token);
      setMessageDetail(detail);
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load message",
        message: error instanceof Error ? error.message : "Unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMessageDetail();
  }, [messageId]);

  if (isLoading || !messageDetail) {
    return <List.Item.Detail isLoading={true} />;
  }

  const markdown = `# ${messageDetail.subject || "(No Subject)"}

${messageDetail.text || "No text content"}
`;

  return (
    <List.Item.Detail
      markdown={markdown}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label
            title="From"
            text={messageDetail.from.name || messageDetail.from.address}
            icon={Icon.Person}
          />
          <List.Item.Detail.Metadata.Label
            title="Email"
            text={messageDetail.from.address}
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="To"
            text={messageDetail.to.map(t => t.address).join(", ")}
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Date"
            text={formatFullDate(messageDetail.createdAt)}
            icon={Icon.Calendar}
          />
          {messageDetail.hasAttachments && (
            <>
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Attachments"
                text={`${messageDetail.attachments?.length || 0} file(s)`}
                icon={Icon.Paperclip}
              />
            </>
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
}
