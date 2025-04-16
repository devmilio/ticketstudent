import { query, mutation } from "./_generated/server";

export const get = query({
    args: {},
    handler: async (ctx) => {
      return await ctx.db
        .query("events")
        // check for events where "is_cancelled" is undefined : ongoing events
        .filter((q) => q.eq(q.field("is_cancelled"), undefined))
        .collect();
    },
  });