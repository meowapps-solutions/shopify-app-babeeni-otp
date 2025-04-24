import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Divider,
  Box,
} from '@shopify/polaris';

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <Box
      padding="400"
      background="bg-surface-secondary"
      borderRadius="200"
      overflowX='scroll'
    >
      <pre
        style={{
          margin: 0,
          fontFamily: 'monospace',
          fontSize: 'var(--p-font-size-75)',
        }}
      >
        <code>{children}</code>
      </pre>
    </Box>
  );
}
// twilio-b5a9c.web.app

export default function App() {
  const origin = location.origin;

  return (
    <Page title="Babeeni Verify Service">
      <Layout>
        {/* --- Endpoint 1: Send Verification Code --- */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text variant="headingLg" as="h2">
              1. Send Verification Code
            </Text>
            <Text variant="headingMd" as="h3">
              POST {origin}/api/public/verify
            </Text>
            <Text as="p">
              Initiates the verification process by sending an SMS code to the
              provided phone number.
            </Text>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h4">
                  Request Payload
                </Text>
                <Text as="p">
                  Requires a JSON body containing the phone number (string, must
                  start with '+').
                </Text>
                <Text as="p">
                  <strong>Example Payload:</strong>
                </Text>
                <CodeBlock>
                  {`{
  "phoneNumber": "+12345678900"
}`}
                </CodeBlock>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h4">
                  Response Examples
                </Text>

                <Text as="p">
                  <strong>Success (200 OK):</strong>
                </Text>
                <CodeBlock>
                  {`{
  "success": true,
  "message": "Verification code sent"
}`}
                </CodeBlock>

                <Text as="p">
                  <strong>Error (400 Bad Request - Missing/Invalid Input):</strong>
                </Text>
                <CodeBlock>
                  {`// Missing phone number
{ "error": "Phone number is required" }

// Invalid phone number format
{ "error": "Phone number must start with a + sign" }`}
                </CodeBlock>

                <Text as="p">
                  <strong>Error (400 Bad Request - Twilio Error):</strong>
                </Text>
                <CodeBlock>
                  {`{
  "success": false,
  "message": "Error sending verification code"
}`}
                </CodeBlock>
                
                <Text as="p">
                  <strong>Error (429 Too Many Requests):</strong>
                </Text>
                <CodeBlock>
                  {`{
  "success": false,
  "message": "Too many verification requests. Please wait 60 seconds before trying again."
}`}
                </CodeBlock>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Divider />
        </Layout.Section>

        {/* --- Endpoint 2: Check Verification Code --- */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text variant="headingLg" as="h2">
              2. Check Verification Code
            </Text>
            <Text variant="headingMd" as="h3">
              GET {origin}/api/public/verify/:phoneNumber
            </Text>
            <Text as="p">
              Checks if the provided code matches the one sent to the specified
              phone number.
            </Text>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h4">
                  Request Parameters
                </Text>
                <BlockStack gap="100">
                  <Text as="p">
                    <strong>:phoneNumber</strong> (URL Path Parameter): The phone
                    number (must start with '+') that received the code.
                  </Text>
                  <Text as="p">
                    <strong>code</strong> (Query Parameter): The verification
                    code entered by the user.
                  </Text>
                </BlockStack>
                <Text as="p">
                  <strong>Example Request URL:</strong>
                </Text>
                {/* Using CodeBlock for URL example for consistency */}
                <CodeBlock>
                  {`${origin}/api/public/verify/+12345678900?code=123456`}
                </CodeBlock>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h4">
                  Response Examples
                </Text>

                <Text as="p">
                  <strong>Success (200 OK - Code Approved):</strong>
                </Text>
                <CodeBlock>
                  {`{
  "success": true,
  "message": "Verification code checked"
}`}
                </CodeBlock>

                <Text as="p">
                  <strong>Error (400 Bad Request - Invalid Code):</strong>
                </Text>
                <CodeBlock>
                  {`{
  "success": false,
  "message": "Verification code not valid"
}`}
                </CodeBlock>

                <Text as="p">
                  <strong>Error (400 Bad Request - Missing Input):</strong>
                </Text>
                <CodeBlock>
                  {`// Missing code query parameter
{ "error": "Code is required" }`}
                </CodeBlock>

                <Text as="p">
                  <strong>Error (400 Bad Request - Twilio Error):</strong>
                </Text>
                <CodeBlock>
                  {`{
  "success": false,
  "message": "Error checking verification code"
}`}
                </CodeBlock>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
