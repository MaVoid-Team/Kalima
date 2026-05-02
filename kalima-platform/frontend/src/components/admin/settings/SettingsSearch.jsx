import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, User, Lock, Shield, Mail, History, Settings2, Users } from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SettingsSearch({ sections }) {
    const { t, i18n } = useTranslation('admin');
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const isRtl = i18n.dir() === 'rtl';

    // Build a bilingual search index by pulling both English and Arabic translations
    const searchableItems = useMemo(() => {
        const index = {}; // Map of translation key -> { sectionId, texts: string[] }
        
        const relevantKeys = [
            { root: 'settings', sectionId: null },
            { root: 'roles', sectionId: 'review' },
            { root: 'gender', sectionId: 'profile' },
            { root: 'common', sectionId: null }
        ];

        const languages = ['en', 'ar'];

        languages.forEach(lng => {
            const bundle = i18n.getResourceBundle(lng, 'admin');
            if (!bundle) return;

            const flatten = (obj, prefix = '', sectionId = null) => {
                for (const key in obj) {
                    const value = obj[key];
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    let currentSectionId = sectionId;
                    
                    // Logic to determine section mapping based on the full key path
                    const relativePath = fullKey.startsWith('settings.') ? fullKey.slice(9) : null;
                    if (relativePath) {
                        // Priority 1: Check for explicit subKey matches (e.g. 'account.delete' -> security section)
                        const subKeyMatch = sections.find(s => s.subKeys?.some(sk => relativePath.startsWith(sk)));
                        if (subKeyMatch) {
                            currentSectionId = subKeyMatch.id;
                        } else if (!currentSectionId) {
                            // Priority 2: Fallback to root dataKey match (e.g. 'account' -> account section)
                            const rootKey = relativePath.split('.')[0];
                            const sectionMatch = sections.find(s => s.dataKey === rootKey);
                            if (sectionMatch) currentSectionId = sectionMatch.id;
                        }
                    }

                    if (typeof value === 'string' && value.length > 0) {
                        if (!index[fullKey]) {
                            index[fullKey] = { sectionId: currentSectionId, texts: [] };
                        }
                        if (!index[fullKey].texts.includes(value)) {
                            index[fullKey].texts.push(value);
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        flatten(value, fullKey, currentSectionId);
                    }
                }
            };

            relevantKeys.forEach(({ root, sectionId }) => {
                if (bundle[root]) {
                    flatten(bundle[root], root, sectionId);
                }
            });
        });

        // Convert the map to an array of searchable objects
        return Object.entries(index).map(([key, data]) => {
            // Find the display value for the current language
            const displayValue = t(key);
            
            return {
                key,
                sectionId: data.sectionId,
                displayValue,
                // The search string combines all available translations for this key
                searchContent: `${key} ${data.texts.join(' ')}`.toLowerCase()
            };
        });
    }, [i18n.language, sections, t]);

    const filteredItems = useMemo(() => {
        if (!search) return [];
        const query = search.toLowerCase();
        
        const seen = new Set();
        return searchableItems
            .filter(item => {
                const match = item.searchContent.includes(query);
                if (match && !seen.has(item.displayValue)) {
                    seen.add(item.displayValue);
                    return true;
                }
                return false;
            })
            .sort((a, b) => {
                const aVal = a.displayValue.toLowerCase();
                const bVal = b.displayValue.toLowerCase();
                
                // Priority 1: Exact match
                if (aVal === query) return -1;
                if (bVal === query) return 1;
                
                // Priority 2: Starts with query
                const aStarts = aVal.startsWith(query);
                const bStarts = bVal.startsWith(query);
                if (aStarts && !bStarts) return -1;
                if (bStarts && !aStarts) return 1;
                
                return aVal.length - bVal.length; // Shorter matches first
            })
            .slice(0, 20);
    }, [search, searchableItems]);

    const handleSelectSection = (id) => {
        setOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -80; // Offset for header
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className={cn(
                    "relative w-full justify-start text-sm text-muted-foreground sm:pr-12 rounded-2xl h-11 border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all",
                    isRtl ? "pl-12 pr-4" : "pr-12 pl-4"
                )}
                onClick={() => setOpen(true)}
            >
                <Search className={cn("h-4 w-4 shrink-0 opacity-50", isRtl ? "ml-2" : "mr-2")} />
                <span className="inline-flex">{t('settings.searchButton', 'Search settings...')}</span>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput 
                    placeholder={t('settings.searchPlaceholder', 'Type to search...')} 
                    value={search}
                    onValueChange={setSearch}
                />
                <CommandList>
                    <CommandEmpty>{t('common.noResults', 'No results found.')}</CommandEmpty>
                    
                    <CommandGroup heading={t('settings.sections', 'Settings Sections')}>
                        {sections.map((section) => (
                            <CommandItem
                                key={section.id}
                                onSelect={() => handleSelectSection(section.id)}
                                className="flex items-center gap-2"
                            >
                                {section.icon && <section.icon className="h-4 w-4" />}
                                <span>{t(section.translationKey)}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    {search && filteredItems.length > 0 && (
                        <>
                            <CommandSeparator />
                            <CommandGroup heading={t('settings.searchResults', 'Search Results')}>
                                {filteredItems.map((item, index) => (
                                    <CommandItem
                                        key={`${item.key}-${index}`}
                                        onSelect={() => item.sectionId && handleSelectSection(item.sectionId)}
                                        className="flex flex-col items-start gap-0.5"
                                    >
                                        <span className="font-medium text-foreground">{item.displayValue}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            {item.sectionId 
                                                ? t(sections.find(s => s.id === item.sectionId)?.translationKey) 
                                                : item.key.split('.').pop()}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
