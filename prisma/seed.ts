import { generateDemoBatch } from "../src/lib/simulation";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding initial RecoverAI demo payment recovery scenarios...");
  const res = await generateDemoBatch();
  console.log("Seed complete:", res);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
