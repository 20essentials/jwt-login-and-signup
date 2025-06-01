import DbLocal from 'db-local';
const { Schema } = new DbLocal({ path: './db' });
import { z } from 'zod';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const zodUserSchema = z.object({
  _id: z.string().uuid().optional(),
  username: z.string().min(6, 'Username must contain at least 6 characters'),
  password: z.string().min(6, 'Password must contain at least 6 characters')
});

const User = Schema('User', {
  _id: String,
  username: { type: String, required: true },
  password: { type: String, required: true }
});

export class UserDb {
  static async createUser({ username, password }) {
    const user = User.findOne({ username });
    if (user) {
      return { error: true, message: 'This user already exists' };
    }

    const result = await zodUserSchema.safeParseAsync({
      username,
      password
    });

    if (result.success) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = User.create({
        _id: crypto.randomUUID(),
        username,
        password: hashedPassword
      }).save();
      return { error: false, message: 'Successful SignUp', userFromDb: newUser };
    } else {
      const firsErrorMessage = result?.error.issues[0].message ?? '🎅 Try again';
      return { error: true, message: firsErrorMessage };
    }
  }

  static async getUser({ username, password }) {
    const user = User.findOne({ username });
    if (!user) {
      return {
        error: true,
        message: `This user is not registered, please SignUp.`
      };
    }

    //Ahora comparamos si la password es valida o no
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return { error: true, message: 'Password Not valid' };

    return { error: false, message: 'Login Successful', userFromDb: user };
  }
}
