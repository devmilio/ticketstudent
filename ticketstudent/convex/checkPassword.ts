import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const checkPassword = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const correctPassword = process.env.PASSWORD;
    if (!correctPassword) {
      throw new Error("PASSWORD environment variable is not set.");
    }
    return args.password === correctPassword;
  },
});