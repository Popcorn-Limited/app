// @ts-ignore
import mailchimp from "@mailchimp/mailchimp_marketing";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email_address } = req.body;

  mailchimp.setConfig({
    apiKey: process.env.NEXT_PUBLIC_MAILCHIMP_API_KEY,
    server: process.env.NEXT_PUBLIC_MAILCHIMP_SERVER,
  });

  try {
    await mailchimp.lists.setListMember(process.env.NEXT_PUBLIC_MAILCHIMP_LIST_ID, email_address, {
      email_address: email_address,
      status_if_new: "subscribed",
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).send({ error: err });
  }
}
