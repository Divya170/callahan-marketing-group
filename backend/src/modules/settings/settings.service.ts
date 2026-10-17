import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ContentMode } from '../../common/constants/domain';
import { Setting } from './setting.entity';

export interface SiteSettings {
  contentMode: ContentMode;
  bookingUrl: string;
  simulateServerError: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  contentMode: 'preview',
  bookingUrl: '',
  simulateServerError: false,
  contactName: 'Miles Callahan',
  contactEmail: 'miles.callahan@hotmail.com',
  contactPhone: '+1 (617) 316-7529',
  addressLine1: '201 S Rosalind Ave',
  addressLine2: 'Orlando, FL 32801',
};

export interface PublicSite {
  contentMode: ContentMode;
  preview: boolean;
  booking: { enabled: boolean; url: string };
  contact: {
    name: string;
    email: string;
    phone: string;
    phoneHref: string;
    addressLine1: string;
    addressLine2: string;
    mapsUrl: string;
  };
}

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(Setting) private readonly repo: Repository<Setting>) {}

  async getAll(): Promise<SiteSettings> {
    const rows = await this.repo.find();
    const out: SiteSettings = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      if (r.key in out) {
        try {
          (out as unknown as Record<string, unknown>)[r.key] = JSON.parse(r.value);
        } catch {
          /* ignore corrupt value, keep default */
        }
      }
    }
    return out;
  }

  async update(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const entries = Object.entries(patch).filter(([k, v]) => k in DEFAULT_SETTINGS && v !== undefined);
    if (entries.length) {
      await this.repo.save(entries.map(([key, value]) => this.repo.create({ key, value: JSON.stringify(value) })));
    }
    return this.getAll();
  }

  async isPreview(): Promise<boolean> {
    return (await this.getAll()).contentMode !== 'production';
  }

  /** Booking links must be absolute https URLs to be used on the public site. */
  static bookingEnabled(url: string): boolean {
    return /^https:\/\/\S+$/i.test(String(url || '').trim());
  }

  async getPublicSite(): Promise<PublicSite> {
    const s = await this.getAll();
    const bookingUrl = s.bookingUrl.trim();
    const enabled = SettingsService.bookingEnabled(bookingUrl);
    const address = `${s.addressLine1} ${s.addressLine2}`.trim();
    return {
      contentMode: s.contentMode,
      preview: s.contentMode !== 'production',
      booking: { enabled, url: enabled ? bookingUrl : '' },
      contact: {
        name: s.contactName,
        email: s.contactEmail,
        phone: s.contactPhone,
        phoneHref: 'tel:' + s.contactPhone.replace(/[^\d+]/g, ''),
        addressLine1: s.addressLine1,
        addressLine2: s.addressLine2,
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address).replace(/%20/g, '+'),
      },
    };
  }
}
