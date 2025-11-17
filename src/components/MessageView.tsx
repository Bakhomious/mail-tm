import { Detail, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import TurndownService from "turndown";
import { getMessageDetail, markMessageAsSeen } from "../api";
import { MessageDetail } from "../types";
import { formatFullDate } from "../utils/formatters";

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndownService.remove(['style', 'script', 'noscript', 'iframe']);

interface MessageViewProps {
  messageId: string;
  token: string;
}

export function MessageView({ messageId, token }: MessageViewProps) {
  const [messageDetail, setMessageDetail] = useState<MessageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadMessageDetail() {
    setIsLoading(true);
    try {
      const detail = await getMessageDetail(messageId, token);
      setMessageDetail(detail);

      if (!detail.seen) {
        await markMessageAsSeen(messageId, token);
      }
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
    return <Detail isLoading={true} />;
  }

  const bodyContent = messageDetail.html && messageDetail.html.length > 0
    ? turndownService.turndown(messageDetail.html.join('\n'))
    : messageDetail.text || "No content";

  const markdown = [
    `# ${messageDetail.subject || "(No Subject)"}`,
    '',
    bodyContent
  ].join('\n');

  return (
    <Detail
      markdown={markdown}
      navigationTitle={messageDetail.subject || "(No Subject)"}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="From"
            text={messageDetail.from.name || messageDetail.from.address}
          />
          <Detail.Metadata.Label
            title="Email"
            text={messageDetail.from.address}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="To"
            text={messageDetail.to.map(t => t.address).join(", ")}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Date"
            text={formatFullDate(messageDetail.createdAt)}
          />
          {messageDetail.hasAttachments && (
            <>
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label
                title="Attachments"
                text={`${messageDetail.attachments?.length || 0} file(s)`}
              />
            </>
          )}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Full Email Content"
            content={bodyContent}
            shortcut={{ modifiers: ["cmd", "shift"], key: "e" }}
          />
          <Action.CopyToClipboard
            title="Copy Sender Email"
            content={messageDetail.from.address}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  );
}
