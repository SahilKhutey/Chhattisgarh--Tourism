import { createMockPrisma } from "../../../test/test-helpers";
import { PrismaService } from "../../database/prisma.service";

export { createMockPrisma };

export const createPrismaMockProvider = () => ({
  provide: PrismaService,
  useValue: createMockPrisma(),
});
