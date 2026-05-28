/**
 * Auto-Export Service — Supabase Storage
 *
 * Saves finalized, branded images to the 'Ready to Post' folder
 * in Supabase Storage. In production this would upload actual
 * rendered image buffers. For the demo it records the export
 * metadata and returns signed URLs.
 */

import { isMockMode } from "../mock.js";

// ============================================================
// Types
// ============================================================

export interface ExportTarget {
  bucket: string;
  folder: string;
  filename: string;
}

export interface ExportResult {
  success: boolean;
  /** Supabase Storage path */
  storagePath: string;
  /** Public or signed URL for the exported asset */
  publicUrl: string;
  /** Size in bytes (simulated) */
  sizeBytes: number;
  exportedAt: string;
}

export interface BatchExportResult {
  propertyId: string;
  brand: string;
  exports: ExportResult[];
  totalSizeBytes: number;
  exportedAt: string;
}

// ============================================================
// Constants
// ============================================================

const SUPABASE_BUCKET = "marketing-assets";
const READY_TO_POST_FOLDER = "ready-to-post";

// ============================================================
// Helpers
// ============================================================

function generateStoragePath(
  propertyId: string,
  brand: string,
  index: number,
  ext: string = "jpg",
): string {
  const datePart = new Date().toISOString().slice(0, 10);
  return `${READY_TO_POST_FOLDER}/${brand}/${datePart}/${propertyId}/card-${index + 1}.${ext}`;
}

function simulateFileSize(): number {
  // Branded overlay images typically 200-400KB
  return Math.floor(200_000 + Math.random() * 200_000);
}

// ============================================================
// Public API
// ============================================================

/**
 * Export a single branded asset to Supabase Storage.
 */
export async function exportAsset(
  renderedUrl: string,
  propertyId: string,
  brand: string,
  index: number,
): Promise<ExportResult> {
  const storagePath = generateStoragePath(propertyId, brand, index);
  const sizeBytes = simulateFileSize();

  // In production:
  //   1. Fetch the rendered image buffer
  //   2. Upload to supabase.storage.from(SUPABASE_BUCKET).upload(storagePath, buffer)
  //   3. Get the signed/public URL
  //
  // For demo mode we simulate the upload and return a mock URL.

  const publicUrl = `https://<project>.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}/${storagePath}`;

  return {
    success: true,
    storagePath,
    publicUrl,
    sizeBytes,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Batch-export all branded assets for a property to the
 * 'Ready to Post' folder in Supabase Storage.
 */
export async function exportPropertyAssets(
  renderedUrls: string[],
  propertyId: string,
  brand: string,
): Promise<BatchExportResult> {
  const exports = await Promise.all(
    renderedUrls.map((url, i) => exportAsset(url, propertyId, brand, i)),
  );

  const totalSizeBytes = exports.reduce((sum, e) => sum + e.sizeBytes, 0);

  return {
    propertyId,
    brand,
    exports,
    totalSizeBytes,
    exportedAt: new Date().toISOString(),
  };
}
