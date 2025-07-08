import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  InlineGrid,
  TextField,
  useBreakpoints,
  Divider,
  Button,

} from "@shopify/polaris";
import { useState } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";

//Import prisma db
import db from "../db.server";

export async function loader() {

  let settings = await db.settings.findFirst();
  return json(settings);
}

export async function action({ request }) {
  let settings = await request.formData();
  settings = Object.fromEntries(settings);

  // update database
  await db.settings.upsert({
      where: { id: '1' }, // Assuming there's only one settings record
      update: settings, // Update the existing record
      create: { ...settings, id: '1' }, // Create a new record if it doesn't exist
    });

  return json(settings);
}

export default function SettingsPage() {
  const settings = useLoaderData();
  const { smUp } = useBreakpoints();
  const [formState, setFormState] = useState(settings);
  

  return (
    <Page>
      <TitleBar title="Settings" />
<BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Update app settings and preferences
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <Form method="post">
            <BlockStack gap="400">
              <TextField label="App Name" name="name" value={formState?.name} onChange={(value) => setFormState({ ...formState, name: value })}/>
              <TextField label="Description" name="description" value={formState?.description} onChange={(value) => setFormState({ ...formState, description: value })}/>
                <Button submit={true}>Save</Button>
            </BlockStack>
            </Form>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
