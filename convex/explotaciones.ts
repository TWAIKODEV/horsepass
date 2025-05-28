import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createExplotacion = mutation({
  args: {
    nombre: v.string(),
    email: v.optional(v.string()),
    codigoRega: v.string(),
    direccion: v.string(),
    municipio: v.string(),
    provincia: v.string(),
    codigoPostal: v.string(),
    telefono: v.string(),
    tipoExplotacion: v.string(),
    capacidadMaxima: v.number(),
    idPropietario: v.id("users")
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("explotaciones", {
      ...args,
      fechaRegistro: Date.now(),
      activa: true
    });
  },
});

export const getExplotaciones = query({
  handler: async (ctx) => {
    return await ctx.db.query("explotaciones").collect();
  },
});

export const getExplotacionesByPropietario = query({
  args: { idPropietario: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("explotaciones")
      .withIndex("by_propietario", (q) => q.eq("idPropietario", args.idPropietario))
      .collect();
  },
});

export const updateExplotacion = mutation({
  args: {
    id: v.id("explotaciones"),
    nombre: v.optional(v.string()),
    direccion: v.optional(v.string()),
    telefono: v.optional(v.string()),
    capacidadMaxima: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, updateData);
  },
});