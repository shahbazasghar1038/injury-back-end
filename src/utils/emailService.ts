import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmail,
} from "@sendinblue/client";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  private static apiInstance: TransactionalEmailsApi;

  private static initializeApiInstance() {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoEmail = process.env.BREVO_EMAIL;

    if (!brevoApiKey || !brevoEmail) {
      throw new Error(
        "BREVO_API_KEY and BREVO_EMAIL must be set in environment variables"
      );
    }

    this.apiInstance = new TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      brevoApiKey
    );
  }

  static async send(
    receiverEmail: string | string[],
    options: { subjectLine: string; contentBody: string }
  ): Promise<void> {
    if (!this.apiInstance) {
      this.initializeApiInstance();
    }

    const brevoEmail = process.env.BREVO_EMAIL;
    const body: SendSmtpEmail = {
      sender: { email: brevoEmail, name: "Med Legal AI" },
      subject: options.subjectLine,
      htmlContent: `<!DOCTYPE html><html><body>${options.contentBody}</body></html>`,
      to: [],
    };

    if (Array.isArray(receiverEmail)) {
      receiverEmail.forEach((email) => body.to?.push({ email }));
    } else {
      body.to?.push({ email: receiverEmail });
    }

    try {
      await this.apiInstance.sendTransacEmail(body);
    } catch (error) {
      console.error("Error sending email:", (error as Error).message || error);
    }
  }
}

export default EmailService;
