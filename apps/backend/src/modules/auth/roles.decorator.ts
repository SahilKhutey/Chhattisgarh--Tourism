import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @Roles() decorator — annotate controller methods with required role strings.
 * Used together with RolesGuard to enforce RBAC on API routes.
 *
 * Usage:
 *   @Roles('ADMIN', 'SUPER_ADMIN')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   async adminRoute() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
