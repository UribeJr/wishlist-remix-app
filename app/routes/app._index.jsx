import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
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
import { authenticate } from "../shopify.server";

 // Importing CORS utility
import { cors } from "remix-utils/cors";
//Import prisma db
import db from "../db.server";
import { useLoaderData, Form } from "@remix-run/react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Fetch all wishlist data from the database
  const wishlists = await db.wishlist.findMany();
  return await cors(request,{ wishlists });
};


// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);
//   const color = ["Red", "Orange", "Yellow", "Green"][
//     Math.floor(Math.random() * 4)
//   ];
//   const response = await admin.graphql(
//     `#graphql
//       mutation populateProduct($product: ProductCreateInput!) {
//         productCreate(product: $product) {
//           product {
//             id
//             title
//             handle
//             status
//             variants(first: 10) {
//               edges {
//                 node {
//                   id
//                   price
//                   barcode
//                   createdAt
//                 }
//               }
//             }
//           }
//         }
//       }`,
//     {
//       variables: {
//         product: {
//           title: `${color} Snowboard`,
//         },
//       },
//     },
//   );
//   const responseJson = await response.json();
//   const product = responseJson.data.productCreate.product;
//   const variantId = product.variants.edges[0].node.id;
//   const variantResponse = await admin.graphql(
//     `#graphql
//     mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
//       productVariantsBulkUpdate(productId: $productId, variants: $variants) {
//         productVariants {
//           id
//           price
//           barcode
//           createdAt
//         }
//       }
//     }`,
//     {
//       variables: {
//         productId: product.id,
//         variants: [{ id: variantId, price: "100.00" }],
//       },
//     },
//   );
//   const variantResponseJson = await variantResponse.json();

//   return {
//     product: responseJson.data.productCreate.product,
//     variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
//   };
// };

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



  // useEffect(() => {
  //   if (productId) {
  //     shopify.toast.show("Product created");
  //   }
  // }, [productId, shopify]);
  // const generateProduct = () => fetcher.submit({}, { method: "POST" });

  
  // Fetch wishlist data from the loader
  const { wishlists } = useLoaderData();

  const rows = wishlists.map(wishlist => [
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
          columnContentTypes={[
            'numeric',
            'numeric',
            'numeric',
          ]}
          headings={[
            'Customer ID',
            'Product ID',
            'Created At',
          ]}
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
