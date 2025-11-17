import { showToast, Toast, Clipboard } from "@raycast/api";
import { generateEmail } from "../api";
import { saveEmail } from "../storage";
import { GenerateEmailOptions } from "../types";

export async function handleQuickGenerate(): Promise<void> {
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

export async function handleCustomGenerate(options: GenerateEmailOptions): Promise<void> {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Generating..."
  });

  try {
    const email = await generateEmail(options);
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
