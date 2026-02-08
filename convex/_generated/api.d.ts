/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activations from "../activations.js";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as banners from "../banners.js";
import type * as cars from "../cars.js";
import type * as communities from "../communities.js";
import type * as events from "../events.js";
import type * as leads from "../leads.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activations: typeof activations;
  admin: typeof admin;
  auth: typeof auth;
  banners: typeof banners;
  cars: typeof cars;
  communities: typeof communities;
  events: typeof events;
  leads: typeof leads;
  reviews: typeof reviews;
  seed: typeof seed;
  settings: typeof settings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
