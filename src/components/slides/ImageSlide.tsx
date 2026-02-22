import type { SlideData } from '../../types';
import { EditableText } from '../ui/EditableText';

interface SlideProps {
  data: SlideData;
  updateData: (newData: Partial<SlideData>) => void;
}

export const ImageSlide = ({ data, updateData }: SlideProps) => (
  <div className="relative h-full w-full z-10">
    {/* Full-bleed background image */}
    {data.imageUrl && (
      <img
        src={data.imageUrl}
        alt={data.title || 'Slide image'}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}
    {/* Gradient overlay for text legibility */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    {/* Title positioned at bottom */}
    <div className="absolute bottom-0 left-0 right-0 p-20">
      <EditableText
        tag="h1"
        text={data.title}
        onChange={(val: string) => updateData({ title: val })}
        className="text-7xl font-bold text-white tracking-tight drop-shadow-xl"
      />
    </div>
  </div>
);
