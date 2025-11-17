import { ActionPanel, Action, List, Icon, Color, useNavigation } from "@raycast/api";
import { EmailListView } from "./components/EmailListView";
import { CustomizeEmailForm } from "./components/CustomizeEmailForm";
import { handleQuickGenerate } from "./actions/emailActions";

export default function Command() {
  const { push } = useNavigation();

  function handleViewEmails() {
    push(<EmailListView />);
  }

  function handleCustomize() {
    push(<CustomizeEmailForm />);
  }

  return (
    <List>
      <List.Item
        title="Quick Generate"
        subtitle="Generate a random temporary email instantly"
        icon={{ source: Icon.Bolt, tintColor: Color.Yellow }}
        actions={
          <ActionPanel>
            <Action title="Generate" onAction={handleQuickGenerate} />
            <Action.OpenInBrowser
              title="Visit Mail.tm"
              url="https://mail.tm"
              shortcut={{ modifiers: ["cmd"], key: "o" }}
            />
          </ActionPanel>
        }
      />
      <List.Item
        title="Customize Email"
        subtitle="Create an email with custom address and password"
        icon={{ source: Icon.Pencil, tintColor: Color.Blue }}
        actions={
          <ActionPanel>
            <Action title="Customize" onAction={handleCustomize} />
            <Action.OpenInBrowser
              title="Visit Mail.tm"
              url="https://mail.tm"
              shortcut={{ modifiers: ["cmd"], key: "o" }}
            />
          </ActionPanel>
        }
      />
      <List.Item
        title="View Saved Emails"
        subtitle="Manage your temporary emails"
        icon={{ source: Icon.Envelope, tintColor: Color.Green }}
        actions={
          <ActionPanel>
            <Action title="View" onAction={handleViewEmails} />
            <Action.OpenInBrowser
              title="Visit Mail.tm"
              url="https://mail.tm"
              shortcut={{ modifiers: ["cmd"], key: "o" }}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}
