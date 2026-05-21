import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * RolesGuard — enforces role-based access control.
 * Must be used AFTER JwtAuthGuard so that req.user is populated from the JWT.
 *
 * Usage (on a controller or individual route):
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('ADMIN', 'SUPER_ADMIN')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator — route is public within an authenticated context
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return !!(user && requiredRoles.includes(user.role));
  }
}
