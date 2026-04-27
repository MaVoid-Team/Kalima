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

    // Build the search index by pulling all relevant translations
    const searchableItems = useMemo(() => {
        const items = [];
        const bundle = i18n.getResourceBundle(i18n.language, 'admin');
        if (!bundle) return items;

        // Parts of the translation bundle that are relevant to the settings page
        const relevantKeys = [
            { root: 'settings', sectionId: null },
            { root: 'roles', sectionId: 'review' },
            { root: 'gender', sectionId: 'profile' },
            { root: 'common', sectionId: null }
        ];

        const flatten = (obj, prefix = '', sectionId = null) => {
            for (const key in obj) {
                const value = obj[key];
                const fullKey = prefix ? `${prefix}.${key}` : key;
                
                // Determine which section this key belongs to
                let currentSectionId = sectionId;
                if (prefix === 'settings') {
                    const sectionMatch = sections.find(s => s.dataKey === key);
                    if (sectionMatch) currentSectionId = sectionMatch.id;
                }

                if (typeof value === 'string' && value.length > 0) {
                    items.push({
                        key: fullKey,
                        value,
                        sectionId: currentSectionId
                    });
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

        return items;
    }, [i18n.language, sections]);

    const filteredItems = useMemo(() => {
        if (!search) return [];
        const query = search.toLowerCase();
        
        // Filter and remove duplicates (some strings might appear in multiple keys)
        const seen = new Set();
        return searchableItems.filter(item => {
            const match = item.value.toLowerCase().includes(query) || 
                          item.key.toLowerCase().includes(query);
            if (match && !seen.has(item.value)) {
                seen.add(item.value);
                return true;
            }
            return false;
        }).slice(0, 10);
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
                                        <span className="font-medium text-foreground">{item.value}</span>
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
