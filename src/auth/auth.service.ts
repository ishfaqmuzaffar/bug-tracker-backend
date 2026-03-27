import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        role: 'USER', // you can change default later
      },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) throw new UnauthorizedException('Invalid password');

    // ✅ FIX: include role in JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      token: this.jwt.sign(payload),
    };
  }
}