import { Html, Head, Body, Container, Heading, Text, Button, Section, Hr, Img, Tailwind } from "@react-email/components";

type Props = {
  donorName: string;
  animalName: string;
  amountFormatted: string;
  isMonthly: boolean;
  animalUrl: string;
  dashboardUrl: string;
  receiptUrl: string;
  shelterName: string;
  animalPhotoUrl?: string;
};

export default function ThankYouEmail({
  donorName, animalName, amountFormatted, isMonthly, animalUrl, dashboardUrl, receiptUrl, shelterName, animalPhotoUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#fbf7ed] font-sans">
          <Container className="mx-auto max-w-xl py-8 px-4">
            <Heading className="font-serif text-3xl text-[#1f1f24] mb-2">Thank you, {donorName.split(" ")[0]}.</Heading>
            <Text className="text-base text-[#404048]">{animalName} has a new sponsor — you.</Text>

            {animalPhotoUrl && (
              <Img src={animalPhotoUrl} alt={animalName} width={560} height={420} className="rounded-2xl my-6 object-cover" />
            )}

            <Section className="bg-white border border-[#e8e3d4] rounded-xl p-6 my-6">
              <Text className="text-xs uppercase tracking-wider text-[#7a7a82] m-0">{isMonthly ? "Monthly sponsorship" : "One-time donation"}</Text>
              <Text className="font-serif text-3xl text-[#1f1f24] mt-1 mb-3">{amountFormatted}{isMonthly ? " / month" : ""}</Text>
              <Text className="text-sm text-[#404048] m-0">For care of <strong>{animalName}</strong> at {shelterName}.</Text>
            </Section>

            <Heading as="h2" className="font-serif text-xl text-[#1f1f24] mt-8 mb-2">What happens next</Heading>
            <Text className="text-sm text-[#404048] leading-relaxed">
              Within 7 days, the team at {shelterName} will post a welcome update on {animalName}'s page — usually a photo and a short note from their caregiver. After that, you'll get a weekly update by email.
            </Text>
            <Text className="text-sm text-[#404048] leading-relaxed">
              Every rupee of your sponsorship lands on a public, tamper-evident ledger you can inspect anytime.
            </Text>

            <Section className="my-6">
              <Button href={animalUrl} className="bg-[#1f1f24] text-[#fbf7ed] py-3 px-6 rounded-full text-sm font-medium mr-2">
                Visit {animalName}'s page
              </Button>
              <Button href={dashboardUrl} className="bg-[#f0a838] text-[#1f1f24] py-3 px-6 rounded-full text-sm font-medium">
                Go to your dashboard
              </Button>
            </Section>

            <Hr className="border-[#e8e3d4] my-8" />

            <Text className="text-xs text-[#7a7a82]">
              80G receipt: <a href={receiptUrl} className="text-[#c9851a] underline">download PDF</a><br/>
              Annual consolidated 80G receipt is emailed every January for tax filing.
            </Text>

            <Text className="text-xs text-[#7a7a82] mt-6">
              You're receiving this because you sponsored {animalName} on PawLedger. To pause or cancel, visit your <a href={dashboardUrl} className="text-[#c9851a] underline">dashboard</a>. Two clicks. No phone calls.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
