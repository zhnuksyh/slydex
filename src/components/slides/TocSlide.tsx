import type { SlideData } from '../../types';
import { EditableText } from '../ui/EditableText';

interface SlideProps {
  data: SlideData;
  updateData: (newData: Partial<SlideData>) => void;
}

export const TocSlide = ({ data, updateData }: SlideProps) => {
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...(data.items || [])];
    newItems[index] = value;
    updateData({ items: newItems });
  };

  return (
    <div className="flex flex-col justify-center h-full w-full px-40 relative z-10">
      <EditableText
        tag="h1"
        text={data.title}
        onChange={(val: string) => updateData({ title: val })}
        className="text-7xl font-bold text-[var(--slide-text-main)] mb-16 tracking-tight"
      />
      <div className="space-y-6">
        {(data.items || []).map((item, index) => (
          <div key={index} className="flex items-center gap-8 group">
            <span
              className="text-6xl font-black min-w-[80px] text-right"
              style={{ color: 'var(--slide-accent)', opacity: 0.6 }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div
              className="h-[2px] w-12 shrink-0"
              style={{ backgroundColor: 'var(--slide-border)' }}
            />
            <EditableText
              tag="span"
              text={item}
              onChange={(val: string) => handleItemChange(index, val)}
              className="text-4xl font-medium text-[var(--slide-text-main)]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
