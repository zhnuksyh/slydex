import type { SlideData } from '../../types';
import { EditableText } from '../ui/EditableText';

interface SlideProps {
  data: SlideData;
  updateData: (newData: Partial<SlideData>) => void;
}

export const EndSlide = ({ data, updateData }: SlideProps) => (
  <div className="flex flex-col items-center justify-center h-full w-full text-center px-40 relative z-10">
    <EditableText
      tag="h1"
      text={data.title}
      onChange={(val: string) => updateData({ title: val })}
      className="text-9xl font-black tracking-tight mb-10 bg-clip-text text-transparent"
      // The inline style applies the vivid gradient to the text
    />
    {/* Gradient overlay on the title */}
    <style>{`
      .end-slide-title {
        background-image: linear-gradient(135deg, var(--slide-accent), var(--slide-accent-sub));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `}</style>
    <div className="end-slide-title">
      <h1 className="text-9xl font-black tracking-tight mb-10">
        {data.title || 'Click to edit'}
      </h1>
    </div>
    <EditableText
      tag="p"
      text={data.subtitle}
      onChange={(val: string) => updateData({ subtitle: val })}
      className="text-4xl text-[var(--slide-text-sub)] font-light max-w-4xl"
    />
  </div>
);
