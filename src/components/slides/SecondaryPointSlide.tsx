import type { SlideData } from '../../types';
import { EditableText } from '../ui/EditableText';

interface SlideProps {
  data: SlideData;
  updateData: (newData: Partial<SlideData>) => void;
}

export const SecondaryPointSlide = ({ data, updateData }: SlideProps) => {
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...(data.items || [])];
    newItems[index] = value;
    updateData({ items: newItems });
  };

  return (
    <div className="flex flex-col justify-center h-full w-full px-40 py-24 relative z-10">
      <EditableText
        tag="h1"
        text={data.title}
        onChange={(val: string) => updateData({ title: val })}
        className="text-6xl font-bold text-[var(--slide-text-main)] mb-16 tracking-tight"
      />
      <div className="grid grid-cols-2 gap-8">
        {(data.items || []).map((item, index) => (
          <div
            key={index}
            className="rounded-2xl p-10 border transition-colors"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              borderColor: 'var(--slide-border)',
            }}
          >
            <span
              className="text-5xl font-black block mb-4"
              style={{ color: 'var(--slide-accent)', opacity: 0.4 }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <EditableText
              tag="span"
              text={item}
              onChange={(val: string) => handleItemChange(index, val)}
              className="text-3xl font-medium text-[var(--slide-text-main)] leading-snug"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
