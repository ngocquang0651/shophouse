import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const responseUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    return {
      accessToken: await this.jwtService.signAsync({
        sub: responseUser.id,
        email: responseUser.email,
        role: responseUser.role
      }),
      user: responseUser
    };
  }
}
