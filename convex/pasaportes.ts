import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPasaporte = mutation({
  args: {
    idCaballo: v.id("caballos"),
    numeroPasaporte: v.string(),
    fechaEmision: v.string(),
    autoridadEmisora: v.string(),
    fechaValidez: v.optional(v.string()),
    urlDocumento: v.optional(v.string()),
    estado: v.string(),
    idEmisor: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pasaportes", {
      ...args,
      fechaRegistro: Date.now()
    });
  },
});

export const getPasaportes = query({
  handler: async (ctx) => {
    return await ctx.db.query("pasaportes").collect();
  },
});

export const getPasaportesByCaballo = query({
  args: { idCaballo: v.id("caballos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pasaportes")
      .withIndex("by_caballo", (q) => q.eq("idCaballo", args.idCaballo))
      .collect();
  },
});