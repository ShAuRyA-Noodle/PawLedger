import { Html, Head, Body, Container, Heading, Text, Button, Section, Tailwind } from "@react-email/components";

type Props = { donorFirstName: string; animalName: string; daysUntilExpiry: number; updateUrl: string; cardLast4: string };

export default function CardExpiryEmail({ donorFirstName, animalName, daysUntilExpiry, updateUrl, cardLast4 }: Props) {
  const urgent = daysUntilExpiry <= 7;
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#fbf7ed] font-sans">
          <Container className="mx-auto max-w-xl py-8 px-4">
            <Heading className="font-serif text-3xl text-[#1f1f24] mb-3">
              Don't let {animalName}'s sponsorship lapse
            </Heading>
            <Text className="text-base text-[#404048]">Hi {donorFirstName},</Text>
            <Text className="text-base text-[#404048] leading-relaxed">
              The card ending •••• {cardLast4} on file for your {animalName} sponsorship expires {urgent ? "in just " : "in "}{daysUntilExpiry} day{daysUntilExpiry === 1 ? "" : "s"}.
            </Text>
            <Text className="text-base text-[#404048] leading-relaxed">
              {urgent ? "Update before it expires to keep your sponsorship active without interruption." : "Update at your convenience — we'll send another reminder closer to the date."}
            </Text>
            <Section className="my-6">
              <Button href={updateUrl} className="bg-[#f0a838] text-[#1f1f24] py-3 px-6 rounded-full text-sm font-medium">
                Update card (one click)
              </Button>
            </Section>
            <Text className="text-xs text-[#7a7a82]">
              No action needed if your card has already been re-issued — we're often able to update automatically via the card network.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
