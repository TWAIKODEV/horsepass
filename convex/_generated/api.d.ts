/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as caballos from "../caballos.js";
import type * as certificados from "../certificados.js";
import type * as dashboard from "../dashboard.js";
import type * as explotaciones from "../explotaciones.js";
import type * as pasaportes from "../pasaportes.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  caballos: typeof caballos;
  certificados: typeof certificados;
  dashboard: typeof dashboard;
  explotaciones: typeof explotaciones;
  pasaportes: typeof pasaportes;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
