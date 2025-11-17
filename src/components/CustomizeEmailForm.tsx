import { ActionPanel, Action, Form, showToast, Toast, Clipboard, useNavigation } from "@raycast/api";
import { useState, useEffect } from "react";
import { generateEmail, getAvailableDomains} from "../api";
import { saveEmail } from "../storage";
import { GenerateEmailOptions } from "../types";

export function CustomizeEmailForm() {
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pop } = useNavigation();

  useEffect(() => {
    async function fetchDomains() {
      try {
        const availableDomains = await getAvailableDomains();
        setDomains(availableDomains);
      } catch (error) {
        console.error(error);
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch domains"
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchDomains();
  }, []);

  async function handleSubmit(values: { customAddress: string; customPassword: string; customDomain?: string }) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Generating..."
    });

    try {
      const options: GenerateEmailOptions = {};

      if (values.customAddress) {
        options.customAddress = values.customAddress;
      }

      if (values.customPassword) {
        options.customPassword = values.customPassword;
      }

      if (values.customDomain) {
        options.customDomain = values.customDomain;
      }

      const email = await generateEmail(options);
      await saveEmail(email);

      toast.style = Toast.Style.Success;
      toast.title = "Done!";
      toast.message = email.address;

      await Clipboard.copy(email.address);
      pop();
    } catch (error) {
      console.error(error);
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to generate email";
      toast.message = error instanceof Error ? error.message : "Unexpected error occurred";
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Generate Email" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="Customize your temporary email. Leave fields empty to generate random values." />
      <Form.TextField
        id="customAddress"
        title="Email Address"
        placeholder="Leave empty for random (e.g., happy-blue-cat)"
        info="Enter only the local part (before @)"
      />
      <Form.TextField
        id="customPassword"
        title="Password"
        placeholder="Leave empty for random password"
      />
      {domains.length > 1 ? (
        <Form.Dropdown id="customDomain" title="Domain" defaultValue={domains[0]}>
          {domains.map(domain => (
            <Form.Dropdown.Item key={domain} value={domain} title={domain} />
          ))}
        </Form.Dropdown>
      ) : domains.length === 1 ? (
        <Form.Description text={`Domain: ${domains[0]}`} />
      ) : null}
    </Form>
  );
}
