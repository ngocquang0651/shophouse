import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UserRole } from "../common/enums/user-role.enum";
import { User } from "./schemas/user.schema";

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.userModel.findById(id).exec();
  }

  createUser(input: CreateUserInput) {
    return this.userModel.create({
      ...input,
      email: input.email.toLowerCase().trim()
    });
  }

  async ensureUser(input: CreateUserInput) {
    const existingUser = await this.findByEmail(input.email);
    if (existingUser) {
      return existingUser;
    }

    return this.createUser(input);
  }
}
