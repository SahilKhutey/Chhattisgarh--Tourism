import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking PostgreSQL database connectivity...');

  await prisma.$queryRawSELECT 1;
  console.log('PostgreSQL basic connection: PASS');

  const result = await prisma.$queryRaw<Array<{ version: string }>>
    SELECT version()
  ;
  console.log(PostgreSQL engine version: );

  try {
    const postgis = await prisma.$queryRaw<Array<{ version: string }>>
      SELECT PostGIS_Version() AS version
    ;
    console.log(PostGIS extension version: );
    console.log('PostGIS verification: PASS');
  } catch (err: any) {
    console.warn('PostGIS extension query warning:', err.message);
  }

  await prisma.$disconnect();
  console.log('\nDatabase verification: PASS');
}

main().catch(async (error) => {
  console.error('\nDatabase verification: FAIL', error.message || error);
  await prisma.$disconnect();
  process.exit(1);
});
