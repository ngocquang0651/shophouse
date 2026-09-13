import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
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
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async onModuleInit() {
    const password = await bcrypt.hash("1", 10);
    const existingAdmin = await this.userModel.findOne({
      email: { $in: ["admin", "admin@example.com"] }
    });

    if (existingAdmin) {
      await this.userModel.updateOne(
        { _id: existingAdmin._id },
        { name: "Store Admin", email: "admin", password, role: UserRole.Admin }
      );
    } else {
      await this.userModel.create({
        name: "Store Admin",
        email: "admin",
        password,
        role: UserRole.Admin
      });
    }
  }

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
