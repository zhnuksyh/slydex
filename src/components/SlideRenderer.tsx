import type { Slide, SlideData } from '../types';
import {
  MainSlide,
  TocSlide,
  MainPointSlide,
  SecondaryPointSlide,
  TableSlide,
  ImageSlide,
  EndSlide,
} from './slides';

interface SlideRendererProps {
  slide: Slide;
  updateSlideData?: (id: string, newData: Partial<SlideData>) => void;
}

export const SlideRenderer = ({ slide, updateSlideData }: SlideRendererProps) => {
  const handleUpdate = (newData: Partial<SlideData>) => {
    if (updateSlideData) updateSlideData(slide.id, newData);
  };

  let content;
  switch (slide.type) {
    case 'main':
      content = <MainSlide data={slide.data} updateData={handleUpdate} />;
      break;
    case 'toc':
      content = <TocSlide data={slide.data} updateData={handleUpdate} />;
      break;
    case 'main_point':
      content = <MainPointSlide data={slide.data} updateData={handleUpdate} />;
      break;
    case 'secondary_point':
      content = <SecondaryPointSlide data={slide.data} updateData={handleUpdate} />;
      break;
    case 'table':
      content = <TableSlide data={slide.data} updateData={handleUpdate} />;
      break;
    case 'image':
      content = <ImageSlide data={slide.data} updateData={handleUpdate} />;
      break;
    case 'end':
      content = <EndSlide data={slide.data} updateData={handleUpdate} />;
      break;
    default:
      content = (
        <div className="text-white text-6xl flex items-center justify-center h-full relative z-10">
          Unknown Template
        </div>
      );
  }

  return (
    <div
      id="slide-canvas-content"
      key={slide.id}
      className="absolute inset-0 bg-[var(--slide-bg)] overflow-hidden animate-slide-in"
    >
      <div
        className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 z-0"
        style={{ backgroundColor: 'var(--slide-accent)', opacity: 0.15 }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 z-0"
        style={{ backgroundColor: 'var(--slide-accent-sub)', opacity: 0.15 }}
      />
      {content}
    </div>
  );
};
