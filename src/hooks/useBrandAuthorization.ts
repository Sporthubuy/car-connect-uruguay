import { useBrandAdmin } from './useBrandAdmin';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

export function useBrandAuthorization() {
  const { brandInfo } = useBrandAdmin();
  const client = useConvex();

  const validateModelOwnership = async (modelId: string): Promise<boolean> => {
    if (!brandInfo?.brand_id) return false;
    try {
      const model = await client.query(api.cars.getModel, { modelId: modelId as Id<"models"> });
      return model?.brandId === brandInfo.brand_id;
    } catch {
      return false;
    }
  };

  const validateTrimOwnership = async (trimId: string): Promise<boolean> => {
    if (!brandInfo?.brand_id) return false;
    try {
      const trim = await client.query(api.cars.getTrim, { trimId: trimId as Id<"trims"> });
      if (!trim) return false;
      const model = await client.query(api.cars.getModel, { modelId: trim.modelId });
      return model?.brandId === brandInfo.brand_id;
    } catch {
      return false;
    }
  };

  const validateEventOwnership = async (eventId: string): Promise<boolean> => {
    if (!brandInfo?.brand_id) return false;
    try {
      const event = await client.query(api.events.getEvent, { eventId: eventId as Id<"events"> });
      return event?.brandId === brandInfo.brand_id;
    } catch {
      return false;
    }
  };

  return {
    brandId: brandInfo?.brand_id,
    validateModelOwnership,
    validateTrimOwnership,
    validateEventOwnership,
  };
}
