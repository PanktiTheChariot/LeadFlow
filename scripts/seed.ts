/**
 * Wipes and reseeds the database with two tenants, one user per role in each,
 * and a handful of sample leads. Dev-only - never point this at a shared DB.
 *
 * Usage: npm run seed
 */
import { config } from "dotenv";
config();

import { connectToDatabase } from "../src/lib/db/connect";
import { Company } from "../src/models/Company";
import { User } from "../src/models/User";
import { Lead } from "../src/models/Lead";
import { hashPassword } from "../src/lib/auth/password";
import type { LeadStatus, UserRole } from "../src/types";
import mongoose from "mongoose";

const SEED_PASSWORD = "Password123!";

interface TenantSpec {
  name: string;
  slug: string;
  domain: string;
  leadCompanies: string[];
}

const TENANTS: TenantSpec[] = [
  {
    name: "Acme Robotics",
    slug: "acme-robotics",
    domain: "acme.test",
    leadCompanies: ["Northwind Traders", "Globex Corp", "Initech", "Umbrella Co", "Stark Industries"],
  },
  {
    name: "Blue Harbor Logistics",
    slug: "blue-harbor-logistics",
    domain: "blueharbor.test",
    leadCompanies: ["Wayne Enterprises", "Hooli", "Soylent Corp", "Vandelay Industries", "Pied Piper"],
  },
];

const STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Lost"];

const CONTACT_NAMES = [
  "Morgan Reyes",
  "Priya Shah",
  "Jordan Blake",
  "Aisha Bello",
  "Ethan Cole",
  "Sofia Marin",
  "Liam Foster",
  "Nadia Osei",
];

const SAMPLE_MESSAGES = [
  "I'm interested in your product. Can you tell me more about pricing?",
  "We're evaluating a few vendors. What does onboarding look like?",
  "Can we get a demo scheduled for next week?",
  "Do you offer volume discounts for larger teams?",
  "What integrations do you support out of the box?",
];

async function seedTenant(spec: TenantSpec) {
  const company = await Company.create({ name: spec.name, slug: spec.slug });

  const roles: { role: UserRole; label: string }[] = [
    { role: "admin", label: "Admin" },
    { role: "manager", label: "Manager" },
    { role: "user", label: "User" },
  ];

  const passwordHash = await hashPassword(SEED_PASSWORD);
  const users = await Promise.all(
    roles.map(({ role, label }) =>
      User.create({
        companyId: company._id,
        name: `${label} ${spec.name.split(" ")[0]}`,
        email: `${role}@${spec.domain}`,
        passwordHash,
        role,
      }),
    ),
  );

  const [admin, manager, regularUser] = users;
  const assignees = [admin, manager, regularUser, regularUser, null, manager, regularUser, null];

  const leads = await Promise.all(
    spec.leadCompanies.flatMap((leadCompany, i) => {
      const first = {
        companyId: company._id,
        name: CONTACT_NAMES[i % CONTACT_NAMES.length],
        email: `contact${i}@${leadCompany.toLowerCase().replace(/[^a-z]+/g, "")}.example`,
        phone: `+1-555-01${i}${i}`,
        company: leadCompany,
        status: STATUSES[i % STATUSES.length],
        assignedUserId: assignees[i % assignees.length]?._id ?? null,
        notes: SAMPLE_MESSAGES[i % SAMPLE_MESSAGES.length],
      };
      return [Lead.create(first)];
    }),
  );

  return { company, users, leadCount: leads.length };
}

async function main() {
  await connectToDatabase();

  console.log("Wiping existing Company / User / Lead collections...");
  await Promise.all([Company.deleteMany({}), User.deleteMany({}), Lead.deleteMany({})]);

  const results = [];
  for (const tenant of TENANTS) {
    results.push(await seedTenant(tenant));
  }

  console.log("\nSeed complete.\n");
  console.log("Demo credentials (same password for every seeded account):");
  console.log(`  Password: ${SEED_PASSWORD}\n`);

  for (const { company, users, leadCount } of results) {
    console.log(`${company.name} (${leadCount} leads):`);
    for (const user of users) {
      console.log(`  ${user.role.padEnd(8)} ${user.email}`);
    }
    console.log("");
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
