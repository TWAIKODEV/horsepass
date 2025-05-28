import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCertificadoSalud = mutation({
  args: {
    idCaballo: v.id("caballos"),
    fechaEmision: v.string(),
    fechaValidez: v.string(),
    urlDocumento: v.optional(v.string()),
    numeroCertificado: v.string(),
    idVeterinario: v.optional(v.id("users")),
    resultado: v.string(),
    observaciones: v.optional(v.string()),
    vacunasAplicadas: v.optional(v.string()),
    pruebasRealizadas: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("certificadosSalud", {
      ...args,
      fechaRegistro: Date.now()
    });
  },
});

export const getCertificadosSalud = query({
  handler: async (ctx) => {
    return await ctx.db.query("certificadosSalud").collect();
  },
});

export const getCertificadosByCaballo = query({
  args: { idCaballo: v.id("caballos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificadosSalud")
      .withIndex("by_caballo", (q) => q.eq("idCaballo", args.idCaballo))
      .collect();
  },
});