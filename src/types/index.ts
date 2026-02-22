// --- Types & Schemas ---

export type SlideType = 'main' | 'toc' | 'main_point' | 'secondary_point' | 'table' | 'image' | 'end';

export interface SlideData {
    title?: string;
    subtitle?: string;
    items?: string[];
    headers?: string[];
    rows?: string[][];
    imageUrl?: string;
    notes?: string;
}

export interface Slide {
    id: string;
    type: SlideType;
    data: SlideData;
}
