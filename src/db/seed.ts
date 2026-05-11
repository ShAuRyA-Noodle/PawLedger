// Seed script — produces a demo-able state with 12 shelters, 60 animals, 250 donations,
// 50 SOS reports, ledger entries, and a platform admin user.
//
// Run: pnpm db:seed
//
// Idempotent: clears + reseeds on each run.

import { db, schema } from "./index";
import { sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { calcFees } from "../lib/money";
import { createHash } from "node:crypto";

const SHELTERS = [
  { name: "Friends Forever Trust", city: "Bengaluru", state: "KA" },
  { name: "Karunya Animal Sanctuary", city: "Chennai", state: "TN" },
  { name: "People for Animals (Pune)", city: "Pune", state: "MH" },
  { name: "Voice for Stray Dogs", city: "Bengaluru", state: "KA" },
  { name: "Animal Aid Charitable Trust", city: "Udaipur", state: "RJ" },
  { name: "CARE Foundation", city: "Hyderabad", state: "TG" },
  { name: "PFA Delhi", city: "New Delhi", state: "DL" },
  { name: "Stray Relief & Animal Welfare (STRAW)", city: "Mumbai", state: "MH" },
  { name: "Compassion Unlimited Plus Action", city: "Bengaluru", state: "KA" },
  { name: "Animal Aid Society", city: "Kolkata", state: "WB" },
  { name: "Helping Tails Society", city: "Jaipur", state: "RJ" },
  { name: "Pet Care India", city: "Goa", state: "GA" },
];

const ANIMAL_NAMES_DOG = ["Bruno", "Mango", "Coco", "Bagheera", "Laddoo", "Pari", "Simba", "Maya", "Toffee", "Rocky", "Kaju", "Pepper", "Ginger", "Boondi", "Halwa", "Tiger", "Bunty", "Sheru", "Goldie", "Daisy", "Mishri", "Pixie", "Kalu", "Jugnu", "Chinni", "Mowgli", "Khushi", "Jojo", "Sunny", "Pluto", "Sona", "Chai", "Mocha", "Latte", "Biscuit"];
const ANIMAL_NAMES_CAT = ["Whiskers", "Mittens", "Pumpkin", "Saffron", "Smokey", "Luna", "Misty", "Tiya", "Gully", "Pari"];
const ANIMAL_NAMES_COW = ["Gauri", "Kamdhenu", "Nandini", "Lakshmi", "Annapurna"];

const RESCUE_STORIES = [
  "Found at a busy junction with a fractured hind leg. Rushed to the vet, surgery successful. Now recovering at the shelter, learning to trust again.",
  "Abandoned outside the shelter gate at 6am with a note. Three weeks old, dehydrated. Bottle-fed every two hours for the first month. Today she's healthy and full of mischief.",
  "Hit by a vehicle near the highway. Internal bleeding. ICU for 12 days. Made it through. Now back to a calm life with plenty of treats.",
  "Rescued from a hoarding situation along with 22 other animals. Severely malnourished. Slowly rebuilding strength. Loves morning sun.",
  "Pulled from a drain during monsoon. Pneumonia and a maggot wound on the back. Two months of treatment. Today she's healthy, but still gets nervous when it rains.",
  "Picked up after his family moved abroad and left him behind. Confused for weeks. Now he's the shelter's official greeter for new dogs.",
  "Rescued from a chained life on a short rope. Skin scarred, paws raw. Now she runs free in the open shelter compound, tail high.",
];

const UPDATE_BODIES = [
  "Bruno had a great week. Gained 1.2kg, completed his vaccination cycle, and made a new friend in Mango. He's especially loving the morning sun in the open compound. Photo from Tuesday.",
  "Quick check-up today — wound on left flank fully healed. Vet said another two weeks of careful supervision and we can move to general kennel. So happy with how this is going.",
  "She had her first proper play session with the volunteers today. Was reserved at first, then chased a tennis ball for almost 20 minutes. Big milestone.",
  "Slow but steady week. Appetite is up, walking with less of a limp. Will reassess next Monday.",
];

function pick<T>(arr: T[], i?: number): T { return arr[(i ?? Math.floor(Math.random() * arr.length)) % arr.length]; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const PEXELS_DOG_PHOTOS = [
  "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/731022/pexels-photo-731022.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/1390784/pexels-photo-1390784.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/612964/pexels-photo-612964.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/333083/pexels-photo-333083.jpeg?auto=compress&cs=tinysrgb&w=900",
];

const PEXELS_CAT_PHOTOS = [
  "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/979247/pexels-photo-979247.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/170108/pexels-photo-170108.jpeg?auto=compress&cs=tinysrgb&w=900",
];

const PEXELS_COW_PHOTOS = [
  "https://images.pexels.com/photos/162801/cow-cattle-curious-head-162801.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=900",
];

function photoFor(species: "dog" | "cat" | "cow", i: number) {
  const set = species === "dog" ? PEXELS_DOG_PHOTOS : species === "cat" ? PEXELS_CAT_PHOTOS : PEXELS_COW_PHOTOS;
  return set[i % set.length];
}

async function clear() {
  console.log("→ clearing existing seed data…");
  await db.execute(sql`truncate table ${schema.ledgerEntries}, ${schema.donations}, ${schema.sponsorships}, ${schema.payouts}, ${schema.animalUpdates}, ${schema.animalPhotos}, ${schema.vetRecords}, ${schema.sosReports}, ${schema.csrGrants}, ${schema.csrAccounts}, ${schema.complaints}, ${schema.shelterMembers}, ${schema.animals}, ${schema.shelters}, ${schema.earnedBadges}, ${schema.badges}, ${schema.referralCodes}, ${schema.newsletterSubscribers} restart identity cascade`);
}

async function seedShelters() {
  console.log("→ seeding shelters…");
  const rows = SHELTERS.map((s, i) => ({
    id: createId(),
    slug: slug(s.name),
    name: s.name,
    legalName: `${s.name} (Section 8 Company)`,
    entityType: "section_8_company" as const,
    founded: 2005 + i,
    about: `Verified shelter in ${s.city} — caring for rescued strays since ${2005 + i}.`,
    city: s.city, state: s.state, country: "IN" as const,
    pincode: ["560001", "600001", "411001", "110001", "313001"][i % 5],
    addressLine1: `${rand(1, 50)}, ${pick(["Lake View", "Park Road", "Old Town", "Hill Side"])} `,
    email: `info@${slug(s.name)}.org`, phone: `+91 90000 0${1000 + i}`,
    websiteUrl: `https://${slug(s.name)}.org`,
    pan: `AAAAA${1000 + i}A`, gstin: `29AAAAA${1000 + i}A1Z5`,
    cin: `U85100KA20${10 + i}NPL${100000 + i}`,
    registration12a: `12A/${2018}/${1000 + i}`,
    registration80g: `AAATC${1000 + i}D2024-2029`,
    registration80gExpiresAt: new Date(2029, 2, 31),
    csr1: `CSR${100000 + i}`,
    awbiRecognition: `AWBI/${800 + i}`,
    awbiRecognitionExpiresAt: new Date(2027, 0, 1),
    fcraStatus: "not_applicable",
    kycStatus: "verified" as const,
    kycProvider: "idfy",
    kycVerifiedAt: new Date(),
    razorpayLinkedAccountId: `acc_${createId().slice(0, 14)}`,
    isPublished: true, isVerifiedShelter: true,
    trustScore: rand(75, 99),
    animalsInCare: rand(20, 80),
  }));
  await db.insert(schema.shelters).values(rows);
  return rows;
}

async function seedAnimals(shelterIds: string[]) {
  console.log("→ seeding animals…");
  const rows: typeof schema.animals.$inferInsert[] = [];
  let i = 0;
  for (const shelterId of shelterIds) {
    const animalsHere = rand(4, 7);
    for (let j = 0; j < animalsHere; j++) {
      const species = j < 4 ? "dog" : j < 6 ? "cat" : "cow";
      const namePool = species === "dog" ? ANIMAL_NAMES_DOG : species === "cat" ? ANIMAL_NAMES_CAT : ANIMAL_NAMES_COW;
      const name = pick(namePool, i);
      const monthlyCost = species === "cow" ? 350000n : 450000n; // ₹3500-4500 monthly target
      rows.push({
        id: createId(),
        slug: `${slug(name)}-${slug(SHELTERS[shelterIds.indexOf(shelterId)].city)}-${i}`,
        shelterId,
        name,
        species: species as never,
        breed: species === "dog" ? pick(["Indie", "Pariah", "Lab Mix", "Mongrel", "Rottweiler Mix"]) : species === "cat" ? "Indian Domestic" : "Indigenous",
        sex: pick(["male", "female"] as const) as never,
        size: pick(["small", "medium", "large"] as const) as never,
        arrivedAt: new Date(Date.now() - rand(30, 730) * 24 * 60 * 60 * 1000),
        rescueStory: pick(RESCUE_STORIES),
        currentStory: "Doing well at the shelter. Eating regularly, gaining weight, learning to trust people again.",
        currentNeeds: "Monthly sponsors to fund food, vet check-ups, and any unexpected medical care.",
        status: "active" as const,
        monthlyCostPaise: monthlyCost,
        goalFundedPaise: BigInt(rand(0, Number(monthlyCost) * 4)),
        sponsorCount: rand(0, 35),
        heroPhotoUrl: photoFor(species as "dog" | "cat" | "cow", i),
        city: SHELTERS[shelterIds.indexOf(shelterId)].city,
        country: "IN" as const,
        isUrgent: i % 9 === 0,
        isPublished: true,
        publishedAt: new Date(Date.now() - rand(1, 90) * 24 * 60 * 60 * 1000),
      });
      i++;
    }
  }
  await db.insert(schema.animals).values(rows);
  return rows;
}

async function seedAnimalPhotos(animalIds: string[]) {
  console.log("→ seeding animal photos…");
  const rows: typeof schema.animalPhotos.$inferInsert[] = [];
  for (const animalId of animalIds) {
    for (let i = 0; i < 4; i++) {
      rows.push({
        id: createId(),
        animalId,
        url: photoFor("dog", animalIds.indexOf(animalId) + i),
        caption: pick(["Morning sun", "First bath", "After vet visit", "Playing with friends", "Cozy nap"]),
        photographer: pick(["Caregiver Priya", "Volunteer Rahul", "Vet Dr. Sharma"]),
        ord: i + 1,
      });
    }
  }
  if (rows.length) await db.insert(schema.animalPhotos).values(rows);
}

async function seedUpdates(animalIds: string[]) {
  console.log("→ seeding updates…");
  const rows: typeof schema.animalUpdates.$inferInsert[] = [];
  for (const animalId of animalIds) {
    for (let i = 0; i < rand(2, 5); i++) {
      rows.push({
        id: createId(),
        animalId,
        kind: pick(["text", "photo", "milestone", "vet_visit"] as const) as never,
        title: pick(["Weekly update", "Vet check complete", "1 month milestone", "Big improvement!", "Quick note"]),
        body: pick(UPDATE_BODIES),
        publishedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      });
    }
  }
  await db.insert(schema.animalUpdates).values(rows);
}

async function seedVetRecords(animalIds: string[]) {
  console.log("→ seeding vet records…");
  const rows: typeof schema.vetRecords.$inferInsert[] = [];
  for (const animalId of animalIds) {
    for (let i = 0; i < rand(1, 3); i++) {
      rows.push({
        id: createId(),
        animalId,
        visitDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
        vetName: pick(["Dr. Anjali Sharma", "Dr. Rajesh Kumar", "Dr. Meera Iyer"]),
        clinicName: pick(["VetCare Clinic", "PetWell Hospital", "City Animal Hospital"]),
        diagnosis: pick(["Healthy check-up", "Mild infection", "Vaccination - DHPPi+L", "Deworming routine", "Sterilisation follow-up"]),
        treatment: pick(["Course of antibiotics + rest", "Routine check, all clear", "Vaccinated and observed", "Deworming dose administered"]),
        weightKg: rand(800, 4500), // *100
        costPaise: BigInt(rand(50000, 350000)),
      });
    }
  }
  await db.insert(schema.vetRecords).values(rows);
}

async function seedDonationsAndLedger(shelters: { id: string }[], animals: { id: string; shelterId: string }[]) {
  console.log("→ seeding donations + ledger…");
  const donations: typeof schema.donations.$inferInsert[] = [];
  const ledger: typeof schema.ledgerEntries.$inferInsert[] = [];
  // Per-shelter chain head
  const heads: Record<string, { hash: string; height: number }> = {};
  for (const s of shelters) heads[s.id] = { hash: "0".repeat(64), height: -1 };

  for (let i = 0; i < 250; i++) {
    const animal = pick(animals);
    const amount = BigInt(pick([10000, 30000, 30000, 30000, 50000, 50000, 100000, 250000])); // weighted toward ₹300
    const fees = calcFees(amount, "INR", false);
    const donationId = createId();
    const capturedAt = new Date(Date.now() - rand(0, 90) * 24 * 60 * 60 * 1000);
    donations.push({
      id: donationId,
      donorEmail: `donor${i}@example.com`,
      donorName: pick(["Sarah", "Rahul", "Priya", "Aman", "Lisa", "Karthik", "Neha", "Arjun"]) + " " + pick(["K.", "S.", "M.", "R."]),
      shelterId: animal.shelterId,
      animalId: animal.id,
      kind: pick(["recurring", "recurring", "recurring", "one_time"] as const) as never,
      amountPaise: amount,
      currency: "INR" as const,
      platformFeePaise: fees.platformFee,
      paymentFeePaise: fees.processingFee,
      netToShelterPaise: fees.netToShelter,
      gateway: "razorpay" as const,
      gatewayChargeId: `pay_${createId().slice(0, 14)}`,
      status: "succeeded" as const,
      capturedAt,
    });

    // Append ledger entry for donation in
    const head = heads[animal.shelterId];
    const next = (kind: string, description: string, amt: bigint, category?: string) => {
      const height = head.height + 1;
      const payload = JSON.stringify({ shelter: animal.shelterId, animal: animal.id, donation: donationId, kind, description, amount: amt.toString(), height, prev: head.hash });
      const hash = createHash("sha256").update(head.hash + payload).digest("hex");
      ledger.push({
        id: createId(),
        animalId: animal.id,
        shelterId: animal.shelterId,
        donationId,
        kind: kind as never,
        category: category as never,
        description,
        amountPaise: amt,
        currency: "INR" as const,
        occurredAt: capturedAt,
        prevHash: head.hash,
        hash,
        blockHeight: height,
      });
      head.hash = hash; head.height = height;
    };
    next("donation_in", "Donation captured via Razorpay", amount);
    next("fee", "PawLedger platform fee (4%)", -fees.platformFee, "platform_fee");
    next("fee", "Razorpay processing fee", -fees.processingFee, "payment_fee");
  }

  // Add some expense_out entries (vet visits, food)
  for (const animal of animals) {
    const head = heads[animal.shelterId];
    for (let i = 0; i < rand(1, 3); i++) {
      const amt = BigInt(rand(20000, 200000));
      const desc = pick(["Vet consultation + medication", "Monthly food (Pedigree, 10kg)", "Vaccination drive", "Deworming + grooming"]);
      const cat = pick(["medical", "food", "vaccination", "shelter_supplies"]);
      const height = head.height + 1;
      const payload = JSON.stringify({ shelter: animal.shelterId, animal: animal.id, kind: "expense_out", description: desc, amount: (-amt).toString(), height, prev: head.hash });
      const hash = createHash("sha256").update(head.hash + payload).digest("hex");
      ledger.push({
        id: createId(),
        animalId: animal.id,
        shelterId: animal.shelterId,
        kind: "expense_out" as const,
        category: cat as never,
        description: desc,
        vendor: pick(["VetCare Bengaluru", "Pedigree", "Royal Canin", "Local pharmacy"]),
        amountPaise: -amt,
        currency: "INR" as const,
        occurredAt: new Date(Date.now() - rand(1, 60) * 24 * 60 * 60 * 1000),
        prevHash: head.hash,
        hash,
        blockHeight: height,
      });
      head.hash = hash; head.height = height;
    }
  }

  await db.insert(schema.donations).values(donations);
  await db.insert(schema.ledgerEntries).values(ledger);
  console.log(`   ${donations.length} donations + ${ledger.length} ledger entries`);
}

async function seedSOS(shelters: { id: string }[]) {
  console.log("→ seeding SOS reports…");
  const rows: typeof schema.sosReports.$inferInsert[] = [];
  const cities = [
    { name: "Bengaluru", lat: 12.97, lng: 77.59 },
    { name: "Mumbai", lat: 19.07, lng: 72.87 },
    { name: "Delhi", lat: 28.61, lng: 77.21 },
    { name: "Chennai", lat: 13.08, lng: 80.27 },
  ];
  for (let i = 0; i < 50; i++) {
    const c = pick(cities);
    rows.push({
      id: createId(),
      publicId: createId(),
      reporterPhone: `+91 90000 ${10000 + i}`,
      latitude: Math.round((c.lat + (Math.random() - 0.5) * 0.2) * 1e7),
      longitude: Math.round((c.lng + (Math.random() - 0.5) * 0.2) * 1e7),
      city: c.name, country: "IN" as const,
      species: pick(["dog", "cat", "cow"] as const) as never,
      conditionDescription: pick([
        "Limping badly on left hind leg, near junction.",
        "Bleeding cut on shoulder, scared but approachable.",
        "Hit by vehicle, conscious but immobile, near temple gate.",
        "Severely emaciated, underfed for weeks, behind market.",
        "Maggot wound on back, urgent care needed.",
      ]),
      isInjured: i % 2 === 0,
      isHitByVehicle: i % 5 === 0,
      photoUrl: PEXELS_DOG_PHOTOS[i % PEXELS_DOG_PHOTOS.length],
      status: pick(["reported", "claimed", "in_progress", "resolved"] as const) as never,
      claimedByShelterId: i % 3 === 0 ? pick(shelters).id : undefined,
      microFundGoalPaise: 150000n,
      microFundRaisedPaise: BigInt(rand(0, 150000)),
      donorCount: rand(0, 20),
    });
  }
  await db.insert(schema.sosReports).values(rows);
}

async function seedAdmin() {
  console.log("→ seeding admin user…");
  const id = createId();
  await db.insert(schema.user).values({
    id,
    email: "admin@pawledger.org",
    name: "Platform Admin",
    emailVerified: true,
    role: "platform_admin",
    locale: "en",
    preferredCurrency: "INR",
    country: "IN",
    city: "Bengaluru",
  }).onConflictDoNothing();
  console.log("   admin@pawledger.org created (no password — use magic link in dev)");
}

async function seedBadges() {
  console.log("→ seeding badges…");
  await db.insert(schema.badges).values([
    { id: createId(), slug: "first-sponsor", title: "First sponsor", description: "Started your first monthly sponsorship.", criteriaJson: { kind: "first_sponsorship" } },
    { id: createId(), slug: "1-year", title: "One year together", description: "12 months sponsoring the same animal.", criteriaJson: { kind: "anniversary", months: 12 } },
    { id: createId(), slug: "10-vet-visits", title: "Funded 10 vet visits", description: "Your contributions helped fund 10 vet visits.", criteriaJson: { kind: "outcome_count", outcome: "vet_visit", n: 10 } },
    { id: createId(), slug: "sos-funder", title: "SOS responder", description: "Funded a street rescue case.", criteriaJson: { kind: "sos_funder" } },
    { id: createId(), slug: "shelter-builder", title: "Shelter builder", description: "Sponsored animals at 3+ different shelters.", criteriaJson: { kind: "shelter_diversity", n: 3 } },
  ]).onConflictDoNothing();
}

async function main() {
  await clear();
  await seedAdmin();
  await seedBadges();
  const shelters = await seedShelters();
  const animals = await seedAnimals(shelters.map(s => s.id!));
  await Promise.all([
    seedAnimalPhotos(animals.map(a => a.id!)),
    seedUpdates(animals.map(a => a.id!)),
    seedVetRecords(animals.map(a => a.id!)),
  ]);
  await seedDonationsAndLedger(shelters as Array<{ id: string }>, animals.map(a => ({ id: a.id!, shelterId: a.shelterId })));
  await seedSOS(shelters as Array<{ id: string }>);
  console.log("\n✓ Seed complete.");
  console.log(`  ${shelters.length} shelters · ${animals.length} animals · 250 donations · 50 SOS cases`);
  console.log("  Admin: admin@pawledger.org");
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
