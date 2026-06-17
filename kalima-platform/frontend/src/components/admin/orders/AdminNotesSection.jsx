import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save, User, Clock } from 'lucide-react';
import useAuth from '@/hooks/auth/useAuth';
import { formatOrderDate } from '@/lib/storeUtils';

export default function AdminNotesSection({ orderId, initialNote, onSaveNote }) {
    const { t, i18n } = useTranslation('admin');
    const { user } = useAuth();
    const [newNote, setNewNote] = useState('');

    const handleSave = async () => {
        if (!newNote.trim()) return;

        const separator = initialNote ? '\n\n---\n\n' : '';
        const timestamp = formatOrderDate(new Date().toISOString(), i18n.language);
        const adminName = user?.name || t('common.admin', 'Admin');
        const appendedText = `${initialNote || ''}${separator}[${timestamp} - ${adminName}]\n${newNote}`;

        const res = await onSaveNote(orderId, appendedText);
        if (res?.success) {
            toast.success(t('orders.messages.noteSaved', 'Admin note saved successfully'));
            setNewNote('');
        }
    };

    const renderTextWithLinks = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {part}
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const parseNotes = (text) => {
        if (!text) return [];
        return text.split('---').map(part => {
            const trimmed = part.trim();
            if (!trimmed) return null;

            // Match [timestamp - admin]\ncontent
            const match = trimmed.match(/^\[(.*?) - (.*?)\]\s*([\s\S]*)$/);
            if (match) {
                return {
                    timestamp: match[1],
                    admin: match[2],
                    content: match[3].trim()
                };
            }
            return {
                timestamp: null,
                admin: null,
                content: trimmed
            };
        }).filter(Boolean);
    };

    const notes = parseNotes(initialNote).reverse();

    const maxAllowedChars = 5000;
    const currentLength = initialNote?.length || 0;
    const remainingChars = Math.max(0, maxAllowedChars - currentLength - 50); // 50 buffer for dates/separators

    return (
        <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">{t('orders.details.adminNotes')}</h3>

            {notes.length > 0 && (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {notes.map((note, index) => (
                        <div key={index} className="bg-muted/30 border border-border/50 rounded-lg p-4 transition-all hover:bg-muted/50">
                            {(note.admin || note.timestamp) && (
                                <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted-foreground border-b border-border/40 pb-2">
                                    {note.admin && (
                                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                                            <User className="h-3.5 w-3.5" />
                                            {note.admin}
                                        </div>
                                    )}
                                    {note.timestamp && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {note.timestamp}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                                {renderTextWithLinks(note.content)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {remainingChars > 0 ? (
                <div className="space-y-2">
                    <textarea
                        className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input bg-background resize-y"
                        placeholder={t('orders.details.addAdminNote', 'Add a new note...')}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        maxLength={remainingChars}
                        data-testid="admin-orders-note-textarea"
                    />
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground" dir="ltr">
                                {newNote.length} / {remainingChars}
                            </span>
                            <Button onClick={handleSave} size="sm" className="flex items-center" disabled={!newNote.trim()} data-testid="admin-orders-save-note-button">
                                <Save className="h-4 w-4 me-2" />
                                {t('orders.details.saveNote')}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-destructive">
                    {t('orders.details.noteLimitReached', 'Maximum note length reached.')}
                </div>
            )}
        </div>
    );
}
