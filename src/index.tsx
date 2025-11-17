import { ActionPanel, Action, List, showToast, Toast, Icon, Color, Clipboard, useNavigation } from "@raycast/api";
import { generateEmail } from "./api";
import { saveEmail } from "./storage";
import { EmailListView } from "./components/EmailListView";
import { CustomizeEmailForm } from "./components/CustomizeEmailForm";

export default function Command() {
  const { push } = useNavigation();

  async function handleQuickGenerate() {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Generating..."
    });

    try {
      const email = await generateEmail();
      await saveEmail(email);

      toast.style = Toast.Style.Success;
      toast.title = "Done!";
      toast.message = email.address;

      await Clipboard.copy(email.address);
    } catch (error) {
      console.error(error);
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to generate email";
      toast.message = error instanceof Error ? error.message : "Unexpected error occurred";
    }
  }

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
          </ActionPanel>
        }
      />
    </List>
  );
}
