import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDashboardStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Contar caballos del usuario
    const caballos = await ctx.db
      .query("caballos")
      .withIndex("by_propietario", (q) => q.eq("idPropietario", args.userId))
      .collect();
    
    // Contar documentos activos (pasaportes + certificados)
    const pasaportes = await ctx.db.query("pasaportes").collect();
    const certificados = await ctx.db.query("certificadosSalud").collect();
    
    // Contar explotaciones del usuario
    const explotaciones = await ctx.db
      .query("explotaciones")
      .withIndex("by_propietario", (q) => q.eq("idPropietario", args.userId))
      .collect();

    // Calcular documentos próximos a vencer (30 días)
    const thirtyDaysFromNow = Date.now() + (30 * 24 * 60 * 60 * 1000);
    const proximosVencer = pasaportes.filter(p => 
      p.fechaValidez && new Date(p.fechaValidez).getTime() <= thirtyDaysFromNow
    ).length;

    return {
      totalCaballos: caballos.length,
      documentosActivos: pasaportes.length + certificados.length,
      proximosVencer,
      explotaciones: explotaciones.length
    };
  },
});