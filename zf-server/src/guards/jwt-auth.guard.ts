import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Note to self.  This guard has a side effect of putting the user into the request.

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

