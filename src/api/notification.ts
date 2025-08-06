// src/api/notification.ts
import { BASE_URL } from '../constants';

import type {
  NotificationTemplate,
  NotificationCategory,
  NotificationChannel,
} from '../types/notification';

/**
 * Fetch notification templates from API
 */
export async function getTemplates(): Promise<NotificationTemplate[]> {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch templates');
    const data = await res.json();
    return data.templates ?? [];
  } catch (err) {
    console.error('getTemplates error:', err);
    return [];
  }
}

/**
 * Fetch notification categories from API
 */
export async function getCategories(): Promise<NotificationCategory[]> {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.categories ?? [];
  } catch (err) {
    console.error('getCategories error:', err);
    return [];
  }
}

/**
 * Fetch notification channels from API
 */
export async function getChannels(): Promise<NotificationChannel[]> {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch channels');
    const data = await res.json();
    return data.channels ?? [];
  } catch (err) {
    console.error('getChannels error:', err);
    return [];
  }
}
