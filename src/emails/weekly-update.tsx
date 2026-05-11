import { Html, Head, Body, Container, Heading, Text, Button, Section, Img, Hr, Tailwind } from "@react-email/components";

type Props = {
  donorFirstName: string;
  animalName: string;
  updateBody: string;
  updatePhotoUrl?: string;
  animalUrl: string;
  monthsActive: number;
  shelterName: string;
};

export default function WeeklyUpdateEmail({ donorFirstName, animalName, updateBody, updatePhotoUrl, animalUrl, monthsActive, shelterName }: Props) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#fbf7ed] font-sans">
          <Container className="mx-auto max-w-xl py-8 px-4">
            <Heading className="font-serif text-3xl text-[#1f1f24] mb-2">{animalName}'s week</Heading>
            <Text className="text-sm text-[#7a7a82] m-0">Hi {donorFirstName} — a quick update from {shelterName}.</Text>

            {updatePhotoUrl && (
              <Img src={updatePhotoUrl} alt={`${animalName} this week`} width={560} className="rounded-2xl my-6" />
            )}

            <Text className="text-base text-[#404048] leading-relaxed whitespace-pre-line">{updateBody}</Text>

            <Section className="my-6">
              <Button href={animalUrl} className="bg-[#1f1f24] text-[#fbf7ed] py-3 px-6 rounded-full text-sm font-medium">
                See full update + photos
              </Button>
            </Section>

            <Hr className="border-[#e8e3d4] my-6" />
            <Text className="text-xs text-[#7a7a82]">
              You've been sponsoring {animalName} for {monthsActive} month{monthsActive === 1 ? "" : "s"}. Thank you.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
