const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "file:./apps/backend/prisma/dev.db"
        }
    }
});
prisma.place.count().then(c => console.log('Total places:', c)).finally(() => prisma.$disconnect());
