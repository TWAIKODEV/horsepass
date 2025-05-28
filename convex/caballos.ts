import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCaballo = mutation({
  args: {
    nombre: v.string(),
    idPropietario: v.id("users"),
    ueln: v.string(),
    microchip: v.string(),
    fechaNacimiento: v.string(),
    sexo: v.string(),
    raza: v.string(),
    capa: v.string(),
    paisOrigen: v.string(),
    idExplotacion: v.optional(v.id("explotaciones"))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("caballos", {
      ...args,
      fechaRegistro: Date.now(),
      activo: true
    });
  },
});

export const getCaballos = query({
  handler: async (ctx) => {
    return await ctx.db.query("caballos").collect();
  },
});

export const getCaballosByPropietario = query({
  args: { idPropietario: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("caballos")
      .withIndex("by_propietario", (q) => q.eq("idPropietario", args.idPropietario))
      .collect();
  },
});

export const getCaballosByExplotacion = query({
  args: { idExplotacion: v.id("explotaciones") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("caballos")
      .withIndex("by_explotacion", (q) => q.eq("idExplotacion", args.idExplotacion))
      .collect();
  },
});

export const updateCaballo = mutation({
  args: {
    id: v.id("caballos"),
    nombre: v.optional(v.string()),
    sexo: v.optional(v.string()),
    raza: v.optional(v.string()),
    capa: v.optional(v.string()),
    idExplotacion: v.optional(v.id("explotaciones"))
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, updateData);
  },
});