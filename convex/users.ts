import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    nombre: v.string(),
    apellidos: v.string(),
    email: v.string(),
    password: v.string(),
    tipoUsuario: v.string(),
    numColegiado: v.optional(v.string()),
    numLicenciaTransporte: v.optional(v.string()),
    idAutoridad: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      fechaRegistro: Date.now(),
      activo: true
    });
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    nombre: v.optional(v.string()),
    apellidos: v.optional(v.string()),
    ultimoAcceso: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, {
      ...updateData,
      ultimoAcceso: Date.now()
    });
  },
});