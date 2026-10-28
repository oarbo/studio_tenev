'use client';

import React, { useState, useCallback } from 'react';
import {
  ArrayInputFunctionsProps,
  ArrayOfObjectsFunctions,
  ArrayOfObjectsInputProps,
  set,
  useClient,
} from 'sanity';
import {
  Flex,
  Stack,
  Button,
  Text,
  TextInput,
  Dialog,
  Spinner,
  Box,
} from '@sanity/ui';
import { AddIcon } from '@sanity/icons/Add';
import { createImageUrlBuilder } from '@sanity/image-url';
import { projectId, dataset, apiVersion } from '../env';

const builder = createImageUrlBuilder({ projectId, dataset });

interface SanityAssetItem {
  _id: string;
  _type?: string;
  mimeType?: string;
  url: string;
  originalFilename?: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
      aspectRatio: number;
    };
  };
}

/**
 * Komponent som bevarer Sanity sin 100% originale listevisning (med linjer for hvert bilde,
 * dra-håndtak for å endre rekkefølge og popup på klikk).
 *
 * Nederst plasseres to like knapper side om side:
 * - Venstre kolonne: Sanity sin standard «+ Add item…»
 * - Høyre kolonne: «+ Add multiple…» for å markere flere bilder fra arkivet
 */
export default function BulkMediaSelectInput(props: ArrayOfObjectsInputProps) {
  const { value = [], onChange, readOnly } = props;
  const client = useClient({ apiVersion });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<SanityAssetItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const openLibraryPicker = useCallback(async () => {
    setIsPickerOpen(true);
    setIsLoadingLibrary(true);
    setSelectedAssetIds(new Set());
    setSearchQuery('');

    try {
      const query = `*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && (!defined(mimeType) || mimeType match "image/*" || mimeType match "video/*")] | order(_createdAt desc)[0...300] {
        _id,
        _type,
        mimeType,
        url,
        originalFilename,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }`;
      const assets = await client.fetch<SanityAssetItem[]>(query);
      setLibraryAssets(assets || []);
    } catch (err) {
      console.error('Kunne ikke hente medier fra arkivet:', err);
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [client]);

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const addSelectedAssetsToCarousel = () => {
    if (selectedAssetIds.size === 0) {
      setIsPickerOpen(false);
      return;
    }

    const selectedItems = libraryAssets.filter((a) => selectedAssetIds.has(a._id));
    const newItems = selectedItems.map((asset) => {
      const isVideo =
        asset._type === 'sanity.fileAsset' ||
        (typeof asset.mimeType === 'string' && asset.mimeType.startsWith('video/')) ||
        Boolean(asset.originalFilename?.match(/\.(mp4|webm|mov)$/i));

      if (isVideo) {
        return {
          _type: 'carouselVideo',
          _key: Math.random().toString(36).substring(2, 12),
          video: {
            _type: 'file',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
          alt: '',
        };
      }

      return {
        _type: 'image',
        _key: Math.random().toString(36).substring(2, 12),
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
        alt: '',
      };
    });

    const next = [...(value || []), ...newItems];
    onChange(set(next));
    setIsPickerOpen(false);
  };

  const filteredLibraryAssets = libraryAssets.filter((a) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (a.originalFilename || '').toLowerCase().includes(term);
  });

  // Egendefinert bunnseksjon som setter + Add item... til venstre og + Add multiple... til høyre
  const CustomArrayFunctions = useCallback(
    (arrayFunctionsProps: ArrayInputFunctionsProps<any, any>) => {
      return (
        <ArrayOfObjectsFunctions {...arrayFunctionsProps}>
          <Button
            type="button"
            icon={AddIcon}
            mode="ghost"
            text="Add multiple…"
            onClick={openLibraryPicker}
            disabled={readOnly}
            title="Marker flere eksisterende bilder samtidig og legg dem til i karusellen"
          />
        </ArrayOfObjectsFunctions>
      );
    },
    [openLibraryPicker, readOnly]
  );

  return (
    <>
      {/* 100% original Sanity listevisning med CustomArrayFunctions nederst */}
      {props.renderDefault({
        ...props,
        arrayFunctions: CustomArrayFunctions,
      })}

      {/* DIALOG: Velg flere bilder fra Sanity Mediebibliotek */}
      {isPickerOpen && (
        <Dialog
          header="Velg flere bilder fra mediebiblioteket"
          id="bulk-media-picker"
          onClose={() => setIsPickerOpen(false)}
          width={4}
          footer={
            <Flex justify="space-between" align="center" padding={3}>
              <Text size={1} weight="medium">
                {selectedAssetIds.size} bilde{selectedAssetIds.size !== 1 ? 'r' : ''} markert
              </Text>
              <Flex gap={2}>
                {selectedAssetIds.size > 0 && (
                  <Button
                    type="button"
                    text="Fjern markering"
                    mode="bleed"
                    onClick={() => setSelectedAssetIds(new Set())}
                  />
                )}
                <Button
                  type="button"
                  text="Avbryt"
                  mode="ghost"
                  onClick={() => setIsPickerOpen(false)}
                />
                <Button
                  type="button"
                  text={`Legg til valgte (${selectedAssetIds.size})`}
                  tone="primary"
                  onClick={addSelectedAssetsToCarousel}
                  disabled={selectedAssetIds.size === 0}
                />
              </Flex>
            </Flex>
          }
        >
          <Box padding={4}>
            <Stack space={3}>
              {/* Søkefelt */}
              <TextInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Søk i filnavn..."
              />

              {isLoadingLibrary ? (
                <Flex justify="center" align="center" padding={5}>
                  <Spinner size={3} />
                </Flex>
              ) : filteredLibraryAssets.length === 0 ? (
                <Box padding={4} style={{ textAlign: 'center' }}>
                  <Text size={1} muted>
                    Ingen bilder funnet i arkivet.
                  </Text>
                </Box>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gridAutoRows: '220px',
                    gap: '16px',
                    maxHeight: '65vh',
                    overflowY: 'auto',
                    padding: '8px',
                  }}
                >
                  {filteredLibraryAssets.map((asset) => {
                    const isSelected = selectedAssetIds.has(asset._id);
                    const isVideo =
                      asset._type === 'sanity.fileAsset' ||
                      (typeof asset.mimeType === 'string' && asset.mimeType.startsWith('video/')) ||
                      Boolean(asset.originalFilename?.match(/\.(mp4|webm|mov)$/i));

                    let thumb: string | null = null;
                    if (!isVideo) {
                      try {
                        thumb = builder.image(asset._id).width(500).auto('format').url();
                      } catch {
                        thumb = null;
                      }
                    }

                    const dims = asset.metadata?.dimensions;
                    const dimLabel = dims ? `${dims.width} × ${dims.height}` : isVideo ? 'Video (MP4)' : null;

                    return (
                      <div
                        key={asset._id}
                        onClick={() => toggleAssetSelection(asset._id)}
                        style={{
                          height: '220px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          userSelect: 'none',
                          boxShadow: isSelected ? '0 0 0 2px #93c5fd' : '0 1px 3px rgba(0,0,0,0.05)',
                          position: 'relative',
                          boxSizing: 'border-box',
                        }}
                      >
                        {/* Bildet eller videoen vises med objectFit: 'contain' */}
                        <div
                          style={{
                            height: '165px',
                            minHeight: '165px',
                            maxHeight: '165px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f8fafc',
                            padding: '8px',
                            position: 'relative',
                            boxSizing: 'border-box',
                            flexShrink: 0,
                          }}
                        >
                          {isVideo ? (
                            <video
                              src={asset.url}
                              muted
                              playsInline
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <img
                              src={thumb || asset.url}
                              alt={asset.originalFilename || ''}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          )}

                          {/* Avkryssings-sirkel */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              minWidth: 24,
                              minHeight: 24,
                              flexShrink: 0,
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#2563eb' : 'rgba(255, 255, 255, 0.9)',
                              border: isSelected ? 'none' : '1.5px solid #94a3b8',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              fontWeight: 'bold',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }}
                          >
                            {isSelected ? '✓' : ''}
                          </div>
                        </div>

                        {/* Filnavn og dimensjoner */}
                        <div
                          style={{
                            height: '55px',
                            padding: '6px 10px',
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            boxSizing: 'border-box',
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: '#0f172a',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {asset.originalFilename || 'Bilde'}
                          </div>
                          {dimLabel && (
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                              {dimLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Stack>
          </Box>
        </Dialog>
      )}
    </>
  );
}
