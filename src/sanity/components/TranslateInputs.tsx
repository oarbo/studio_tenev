'use client';

import React, { useState, useCallback } from 'react';
import { StringInputProps, TextInputProps, ArrayOfObjectsInputProps, set, unset, useFormValue } from 'sanity';
import { TextInput, TextArea, Button, Flex, Stack, Text } from '@sanity/ui';

// Innebygd oversettelses-ikon
const TranslateIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

function extractText(val: any): string {
  if (typeof val === 'string') return val.trim();
  if (Array.isArray(val)) {
    return val
      .filter((b: any) => b && b._type === 'block')
      .map((b: any) => (b.children || []).map((c: any) => c.text || '').join(''))
      .join('\n\n')
      .trim();
  }
  return '';
}

export function TranslateStringInput(props: StringInputProps) {
  const { value, onChange, schemaType, readOnly, path } = props;
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Avgjør om dette er et engelsk eller norsk felt
  const currentFieldName = String(path[path.length - 1]);
  const isEn = currentFieldName.endsWith('En');
  const counterpartName = isEn
    ? currentFieldName.slice(0, -2) // f.eks. titleEn -> title
    : `${currentFieldName}En`;      // f.eks. title -> titleEn

  const fromLang = isEn ? 'no' : 'en';
  const toLang = isEn ? 'en-GB' : 'no';
  const buttonLabel = isEn ? 'Oversett fra norsk' : 'Oversett fra engelsk';
  const emptyFeedback = isEn ? 'Fyll ut det norske feltet først' : 'Fyll ut det engelske feltet først';

  const sourcePath = path.slice(0, -1).concat(counterpartName);
  const sourceValue = useFormValue(sourcePath);

  const handleTranslate = useCallback(async () => {
    const textToTranslate = extractText(sourceValue);

    if (!textToTranslate) {
      setFeedback(emptyFeedback);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsTranslating(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate, from: fromLang, to: toLang }),
      });

      if (!res.ok) throw new Error('Kunne ikke oversette');

      const data = await res.json();
      if (data.translatedText) {
        onChange(set(data.translatedText));
        setFeedback('Oversatt!');
        setTimeout(() => setFeedback(null), 2000);
      }
    } catch {
      setFeedback('Feil under oversettelse');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceValue, onChange, fromLang, toLang, emptyFeedback]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.currentTarget.value;
      onChange(nextValue ? set(nextValue) : unset());
    },
    [onChange]
  );

  return (
    <Stack space={2}>
      <Flex justify="flex-end" align="center" gap={2} style={{ minHeight: '26px' }}>
        {feedback && (
          <Text size={1} style={{ color: feedback === 'Oversatt!' ? '#16a34a' : '#d97706', fontSize: '11px' }}>
            {feedback}
          </Text>
        )}
        <Button
          type="button"
          text={buttonLabel}
          icon={TranslateIcon}
          mode="ghost"
          tone="primary"
          fontSize={1}
          padding={2}
          onClick={handleTranslate}
          loading={isTranslating}
          disabled={readOnly || isTranslating}
          title={isEn ? 'Hent og oversett fra det norske feltet' : 'Hent og oversett fra det engelske feltet'}
        />
      </Flex>
      <TextInput
        value={value || ''}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={schemaType.placeholder || (isEn ? 'Engelsk tekst...' : 'Norsk tekst...')}
      />
    </Stack>
  );
}

export function TranslateTextInput(props: TextInputProps) {
  const { value, onChange, schemaType, readOnly, path } = props;
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Avgjør om dette er et engelsk eller norsk felt
  const currentFieldName = String(path[path.length - 1]);
  const isEn = currentFieldName.endsWith('En');
  const counterpartName = isEn
    ? currentFieldName.slice(0, -2) // f.eks. summaryEn -> summary
    : `${currentFieldName}En`;      // f.eks. summary -> summaryEn

  const fromLang = isEn ? 'no' : 'en';
  const toLang = isEn ? 'en-GB' : 'no';
  const buttonLabel = isEn ? 'Oversett fra norsk' : 'Oversett fra engelsk';
  const emptyFeedback = isEn ? 'Fyll ut det norske feltet først' : 'Fyll ut det engelske feltet først';

  const sourcePath = path.slice(0, -1).concat(counterpartName);
  const sourceValue = useFormValue(sourcePath);

  const handleTranslate = useCallback(async () => {
    const textToTranslate = extractText(sourceValue);

    if (!textToTranslate) {
      setFeedback(emptyFeedback);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsTranslating(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate, from: fromLang, to: toLang }),
      });

      if (!res.ok) throw new Error('Kunne ikke oversette');

      const data = await res.json();
      if (data.translatedText) {
        onChange(set(data.translatedText));
        setFeedback('Oversatt!');
        setTimeout(() => setFeedback(null), 2000);
      }
    } catch {
      setFeedback('Feil under oversettelse');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceValue, onChange, fromLang, toLang, emptyFeedback]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = e.currentTarget.value;
      onChange(nextValue ? set(nextValue) : unset());
    },
    [onChange]
  );

  return (
    <Stack space={2}>
      <Flex justify="flex-end" align="center" gap={2} style={{ minHeight: '26px' }}>
        {feedback && (
          <Text size={1} style={{ color: feedback === 'Oversatt!' ? '#16a34a' : '#d97706', fontSize: '11px' }}>
            {feedback}
          </Text>
        )}
        <Button
          type="button"
          text={buttonLabel}
          icon={TranslateIcon}
          mode="ghost"
          tone="primary"
          fontSize={1}
          padding={2}
          onClick={handleTranslate}
          loading={isTranslating}
          disabled={readOnly || isTranslating}
          title={isEn ? 'Hent og oversett fra det norske feltet' : 'Hent og oversett fra det engelske feltet'}
        />
      </Flex>
      <TextArea
        value={value || ''}
        onChange={handleChange}
        readOnly={readOnly}
        rows={(schemaType as any).rows || 3}
        placeholder={schemaType.placeholder || (isEn ? 'Engelsk tekst...' : 'Norsk tekst...')}
      />
    </Stack>
  );
}

export function TranslateBlockInput(props: ArrayOfObjectsInputProps) {
  const { onChange, readOnly, path, renderDefault } = props;
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Avgjør om dette er et engelsk eller norsk felt
  const currentFieldName = String(path[path.length - 1]);
  const isEn = currentFieldName.endsWith('En');
  const counterpartName = isEn
    ? currentFieldName.slice(0, -2) // f.eks. textEn -> text
    : `${currentFieldName}En`;      // f.eks. text -> textEn

  const fromLang = isEn ? 'no' : 'en';
  const toLang = isEn ? 'en-GB' : 'no';
  const buttonLabel = isEn ? 'Oversett fra norsk' : 'Oversett fra engelsk';
  const emptyFeedback = isEn ? 'Fyll ut det norske feltet først' : 'Fyll ut det engelske feltet først';

  const sourcePath = path.slice(0, -1).concat(counterpartName);
  const sourceValue = useFormValue(sourcePath);

  const handleTranslate = useCallback(async () => {
    const textToTranslate = extractText(sourceValue);

    if (!textToTranslate) {
      setFeedback(emptyFeedback);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsTranslating(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate, from: fromLang, to: toLang }),
      });

      if (!res.ok) throw new Error('Kunne ikke oversette');

      const data = await res.json();
      if (data.translatedText) {
        const paragraphs = data.translatedText
          .split(/\n\s*\n/)
          .map((p: string) => p.trim())
          .filter(Boolean);

        const baseBlocks = Array.isArray(sourceValue) ? sourceValue : [];
        const nextBlocks = paragraphs.map((para: string, idx: number) => {
          const baseBlock = baseBlocks[idx];
          return {
            _type: 'block',
            _key: Math.random().toString(36).substring(2, 10),
            style: baseBlock?.style || 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                _key: Math.random().toString(36).substring(2, 10),
                text: para,
                marks: [],
              },
            ],
          };
        });

        onChange(set(nextBlocks));
        setFeedback('Oversatt!');
        setTimeout(() => setFeedback(null), 2000);
      }
    } catch {
      setFeedback('Feil under oversettelse');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceValue, onChange, fromLang, toLang, emptyFeedback]);

  return (
    <Stack space={2}>
      <Flex justify="flex-end" align="center" gap={2} style={{ minHeight: '26px' }}>
        {feedback && (
          <Text size={1} style={{ color: feedback === 'Oversatt!' ? '#16a34a' : '#d97706', fontSize: '11px' }}>
            {feedback}
          </Text>
        )}
        <Button
          type="button"
          text={buttonLabel}
          icon={TranslateIcon}
          mode="ghost"
          tone="primary"
          fontSize={1}
          padding={2}
          onClick={handleTranslate}
          loading={isTranslating}
          disabled={readOnly || isTranslating}
          title={isEn ? 'Hent og oversett fra det norske feltet' : 'Hent og oversett fra det engelske feltet'}
        />
      </Flex>
      {renderDefault(props)}
    </Stack>
  );
}

// -------------------------------------------------------------
// STATUS TRANSLATIONS & AUTOMATISK SYNKRONISERING
// -------------------------------------------------------------
export const STATUS_TRANSLATIONS: Record<string, string> = {
  'Ferdigstilt': 'Completed',
  'Bygget': 'Built',
  'Under bygging': 'Under construction',
  'Under utvikling': 'In development',
  'I prosjektering': 'In planning',
  'Konkurranse': 'Competition',
  'Konsept': 'Concept',
  'Ideprosjekt': 'Concept',
  'Ikke realisert': 'Unrealised',
  'Fiktivt': 'Fictional',
  // Bakoverkompatibilitet for engelske verdier
  'Completed': 'Completed',
  'Built': 'Built',
  'Fictional': 'Fictional',
};

export function StatusEnInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;
  const norwegianStatus = useFormValue(['status']) as string | undefined;
  const defaultEn = norwegianStatus ? STATUS_TRANSLATIONS[norwegianStatus] : undefined;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.currentTarget.value;
      onChange(nextValue ? set(nextValue) : unset());
    },
    [onChange]
  );

  const handleAutoFill = useCallback(() => {
    if (defaultEn) {
      onChange(set(defaultEn));
    }
  }, [defaultEn, onChange]);

  return (
    <Stack space={2}>
      {defaultEn && value !== defaultEn && !readOnly && (
        <Flex justify="flex-end">
          <Button
            type="button"
            text={`Sett til "${defaultEn}"`}
            mode="ghost"
            tone="primary"
            fontSize={1}
            padding={2}
            onClick={handleAutoFill}
            disabled={readOnly}
          />
        </Flex>
      )}
      <TextInput
        value={value || ''}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={defaultEn ? `Standard: ${defaultEn}` : 'Engelsk status...'}
      />
    </Stack>
  );
}
