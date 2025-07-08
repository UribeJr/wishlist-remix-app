import { useEffect } from "react";
import { useFetcher, useLoaderData, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  LegacyCard,
  DataTable,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// 🚫 Removed: import { cors } from "remix-utils/cors";
import db from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Fetch all wishlist data from the database
  const wishlists = await db.wishlist.findMany();
  return json({ wishlists }); // ✅ Use Remix's json() response directly
};

export default function Index() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  const { wishlists } = useLoaderData();

  const rows = wishlists.map((wishlist) => [
    wishlist.customerId,
    wishlist.productId,
    wishlist.createdAt,
  ]);

  return (
    <Page>
      <TitleBar title="Wishlist Products">
        {/* <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button> */}
      </TitleBar>
      <LegacyCard>
        <DataTable
          columnContentTypes={["numeric", "numeric", "numeric"]}
          headings={["Customer ID", "Product ID", "Created At"]}
          rows={rows}
          pagination={{
            hasNext: true,
            onNext: () => {},
          }}
        />
      </LegacyCard>
    </Page>
  );
}
