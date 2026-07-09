import { useCallback, useEffect, useState, useMemo } from 'react';
import { StringInputProps, set, unset, useClient, useFormValue } from 'sanity';
import { TextInput, Popover, Menu, MenuItem, Box, Text, Button } from '@sanity/ui';

// Innebygd SVG-pil for stabilitet
const ChevronIcon = () => (
  <svg viewBox="0 0 25 25" fill="none" width="1em" height="1em" stroke="currentColor" strokeWidth="1.2">
    <path d="M7 10L12.5 15.5L18 10" />
  </svg>
);

export default function AutocompleteStringInput(props: StringInputProps) {
  const { value, onChange, schemaType, path, id } = props;
  const client = useClient({ apiVersion: '2023-05-01' });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fieldName = path[path.length - 1] as string;
  const documentType = useFormValue(['_type']) as string;

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!fieldName || !documentType) return;
      
      const query = `array::unique(*[_type == '${documentType}' && defined(${fieldName})].${fieldName})`;
      try {
        const results = await client.fetch(query);
        if (Array.isArray(results)) {
          setSuggestions(results.filter(Boolean));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSuggestions();
  }, [client, fieldName, documentType]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;
      // Tekstfeltet håndterer lagringen stabilt
      onChange(nextValue ? set(nextValue) : unset());
      setIsOpen(true);
    },
    [onChange]
  );

  const handleSelect = useCallback(
    (suggestion: string) => {
      onChange(set(suggestion));
      setIsOpen(false);
    },
    [onChange]
  );

  // Filtrerer forslagene i menyen dynamisk basert på det som skrives i feltet
  const filteredSuggestions = useMemo(() => {
    const currentValue = (value as string) || '';
    if (!currentValue) return suggestions;
    return suggestions.filter((s) => 
      s.toLowerCase().includes(currentValue.toLowerCase())
    );
  }, [suggestions, value]);

  return (
    <div 
      onBlur={(e) => {
        // Lukker menyen automatisk hvis brukeren klikker et annet sted på skjermen
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }}
    >
      <Popover
        content={
          <Menu style={{ maxWidth: '300px', maxHeight: '200px', overflowY: 'auto' }}>
            {filteredSuggestions.length === 0 ? (
              <Box padding={3}>
                <Text size={1} muted>Ingen forslag funnet</Text>
              </Box>
            ) : (
              filteredSuggestions.map((suggestion) => (
                <MenuItem
                  key={suggestion}
                  text={suggestion}
                  onClick={() => handleSelect(suggestion)}
                />
              ))
            )}
          </Menu>
        }
        open={isOpen}
        portal
        placement="bottom-start"
        fallbackPlacements={['top-start']}
      >
        <Box>
          <TextInput
            id={id || fieldName}
            value={value || ''}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            placeholder={`Skriv inn eller velg ${schemaType.title?.toLowerCase() || ''}...`}
            suffix={
              <Button 
                icon={ChevronIcon} 
                mode="bleed" 
                padding={2} 
                onClick={() => setIsOpen((prev) => !prev)}
              />
            }
          />
        </Box>
      </Popover>
    </div>
  );
}
