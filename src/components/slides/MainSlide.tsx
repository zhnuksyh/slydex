import type { SlideData } from '../../types';
import { EditableText } from '../ui/EditableText';

interface SlideProps {
  data: SlideData;
  updateData: (newData: Partial<SlideData>) => void;
}

export const MainSlide = ({ data, updateData }: SlideProps) => (
  <div className="flex flex-col items-center justify-center h-full w-full text-center px-40 relative z-10">
    <EditableText
      tag="h1"
      text={data.title}
      onChange={(val: string) => updateData({ title: val })}
      className="text-8xl font-bold text-[var(--slide-text-main)] mb-12 tracking-tight leading-tight drop-shadow-lg line-clamp-3"
    />
    <EditableText
      tag="p"
      text={data.subtitle}
      onChange={(val: string) => updateData({ subtitle: val })}
      className="text-5xl text-[var(--slide-accent-sub)] font-light max-w-6xl drop-shadow-md line-clamp-3"
    />
  </div>
);
