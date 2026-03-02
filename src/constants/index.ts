import type { Slide, SlideType } from '../types';

export const THEMES = [
    { id: 'midnight', name: 'Midnight Indigo' },
    { id: 'corporate', name: 'Corporate Slate' },
    { id: 'neon', name: 'Cyberpunk Neon' },
];

export const DEFAULT_SLIDES: Slide[] = [
    {
        id: '1',
        type: 'main',
        data: {
            title: 'The Future of Web Apps',
            subtitle: 'Building smart, scalable presentations with AI',
            notes: 'Welcome the audience and set the tone for the presentation.',
        },
    },
    {
        id: '2',
        type: 'image',
        data: {
            title: 'A New Perspective',
            imageUrl:
                'https://image.pollinations.ai/prompt/abstract-geometric-shapes-glowing-blue-and-purple-dark-background?width=1920&height=1080&nologo=true',
            notes: 'Mention how visualizing data opens up new opportunities.',
        },
    },
    {
        id: '3',
        type: 'main_point',
        data: {
            title: 'The DOM is the perfect styling engine.',
            subtitle:
                'Leveraging HTML and CSS gives us native accessibility and instant global theming.',
            notes: 'Compare this to canvas-based solutions like Figma.',
        },
    },
];

export const TEMPLATE_GUIDE: {
    type: SlideType;
    name: string;
    desc: string;
    mock: Slide;
}[] = [
        {
            type: 'main',
            name: 'Main Title',
            desc: 'The opening slide. Needs a big bold title and an optional subtitle.',
            mock: {
                id: 'm1',
                type: 'main',
                data: { title: 'Project Apollo', subtitle: 'Reaching for the stars in Q4' },
            },
        },
        {
            type: 'toc',
            name: 'Table of Contents',
            desc: 'Displays a numbered list of topics or agenda items.',
            mock: {
                id: 'm2',
                type: 'toc',
                data: {
                    title: 'Agenda',
                    items: ['Introduction', 'Market Analysis', 'Financials', 'Q&A'],
                },
            },
        },
        {
            type: 'main_point',
            name: 'Main Point',
            desc: 'A dramatic, high-impact slide for emphasizing a single core idea.',
            mock: {
                id: 'm3',
                type: 'main_point',
                data: {
                    title: 'Growth is accelerating.',
                    subtitle: 'We have seen a 40% YoY increase in users.',
                },
            },
        },
        {
            type: 'secondary_point',
            name: 'Detailed List',
            desc: 'Perfect for bullet points or features. Displays items in a clean grid.',
            mock: {
                id: 'm4',
                type: 'secondary_point',
                data: {
                    title: 'Key Features',
                    items: [
                        'End-to-end encryption',
                        'Real-time collaboration',
                        'Offline mode',
                        'Cloud backups',
                    ],
                },
            },
        },
        {
            type: 'table',
            name: 'Data Table',
            desc: 'Best for structured tabular data. Automatically handles columns and rows cleanly.',
            mock: {
                id: 'm5',
                type: 'table',
                data: {
                    title: 'Q3 Financials',
                    headers: ['Metric', 'Target', 'Actual'],
                    rows: [
                        ['Revenue', '$1.2M', '$1.5M'],
                        ['Churn', '5%', '3.2%'],
                    ],
                },
            },
        },
        {
            type: 'image',
            name: 'Image Focus',
            desc: 'Showcases a massive image. The AI will generate a custom image URL for you.',
            mock: {
                id: 'm7',
                type: 'image',
                data: {
                    title: 'Visual Expansion',
                    imageUrl:
                        'https://image.pollinations.ai/prompt/vibrant-sunset-over-futuristic-city?width=1920&height=1080&nologo=true',
                },
            },
        },
        {
            type: 'end',
            name: 'End / Thank You',
            desc: 'The closing slide. Uses a vivid gradient text to leave a strong final impression.',
            mock: {
                id: 'm6',
                type: 'end',
                data: {
                    title: 'Thank You',
                    subtitle: 'Questions? Contact hello@slydex.app',
                },
            },
        },
    ];
