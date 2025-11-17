import {
  ActionPanel,
  Action,
  List,
  showToast,
  Toast,
  Icon,
  Alert,
  confirmAlert,
  useNavigation
} from "@raycast/api";
import { useState, useEffect } from "react";
import { deleteEmailFromAPI } from "../api";
import { getEmails, deleteEmail, clearExpiredEmails } from "../storage";
import { TempEmail } from "../types";
import { formatExpiryDate } from "../utils/formatters";
import { MailboxView } from "./MailboxView";

export function EmailListView() {
  const [emails, setEmails] = useState<TempEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useNavigation();

  async function loadEmails() {
    setIsLoading(true);
    await clearExpiredEmails();
    const savedEmails = await getEmails();
    setEmails(savedEmails);
    setIsLoading(false);
  }

  useEffect(() => {
    loadEmails();
  }, []);

  async function handleDelete(email: TempEmail) {
    const confirmed = await confirmAlert({
      title: "Delete Email",
      message: `Are you sure you want to delete ${email.address}?`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Deleting...",
      });

      try {
        await deleteEmailFromAPI(email.accountId, email.token);
        await deleteEmail(email.id);
        await loadEmails();

        toast.style = Toast.Style.Success;
        toast.title = "Email deleted";
      } catch (error) {
        console.error(error);
        toast.style = Toast.Style.Failure;
        toast.title = "Failed to delete";
        toast.message = error instanceof Error ? error.message : "Unexpected error occurred";
      }
    }
  }

  return (
    <List isLoading={isLoading}>
      {emails.length === 0 ? (
        <List.EmptyView
          title="No saved emails"
          description="Generate a temporary email to get started"
          icon={Icon.Envelope}
        />
      ) : (
        emails.map((email) => {
          return (
            <List.Item
              key={email.id}
              title={email.address}
              accessories={[
                { text: formatExpiryDate(email.expiresAt) }
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title="View Mailbox"
                    icon={Icon.Envelope}
                    onAction={() => push(<MailboxView email={email} />)}
                  />
                  <ActionPanel.Section title="Copy">
                    <Action.CopyToClipboard
                      title="Copy Email"
                      content={email.address}
                      shortcut={{ modifiers: ["cmd"], key: "c" }}
                    />
                    <Action.CopyToClipboard
                      title="Copy Password"
                      content={email.password}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      onCopy={async () => {
                        await showToast({
                          style: Toast.Style.Success,
                          title: "Password copied",
                          message: "Sensitive information copied to clipboard"
                        });
                      }}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action
                      title="Refresh"
                      icon={Icon.ArrowClockwise}
                      onAction={loadEmails}
                      shortcut={{ modifiers: ["cmd"], key: "r" }}
                    />
                    <Action
                      title="Delete Email"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={() => handleDelete(email)}
                      shortcut={{ modifiers: ["ctrl"], key: "x" }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
