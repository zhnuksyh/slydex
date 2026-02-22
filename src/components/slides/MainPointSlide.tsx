import type { SlideData } from '../../types';
import { EditableText } from '../ui/EditableText';

interface SlideProps {
  data: SlideData;
  updateData: (newData: Partial<SlideData>) => void;
}

export const MainPointSlide = ({ data, updateData }: SlideProps) => (
  <div className="flex flex-col items-center justify-center h-full w-full text-center px-32 relative z-10">
    <div
      className="w-24 h-1 rounded-full mb-12"
      style={{ backgroundColor: 'var(--slide-accent)' }}
    />
    <EditableText
      tag="h1"
      text={data.title}
      onChange={(val: string) => updateData({ title: val })}
      className="text-7xl font-extrabold text-[var(--slide-text-main)] mb-10 tracking-tight leading-tight max-w-[1400px]"
    />
    <EditableText
      tag="p"
      text={data.subtitle}
      onChange={(val: string) => updateData({ subtitle: val })}
      className="text-4xl text-[var(--slide-text-sub)] font-light max-w-5xl leading-relaxed"
    />
    <div
      className="w-24 h-1 rounded-full mt-12"
      style={{ backgroundColor: 'var(--slide-accent)' }}
    />
  </div>
);
