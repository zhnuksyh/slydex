import type { SlideData } from '../../types';
import { EditableText } from '../ui/EditableText';

interface SlideProps {
  data: SlideData;
  updateData: (newData: Partial<SlideData>) => void;
}

export const TableSlide = ({ data, updateData }: SlideProps) => {
  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...(data.headers || [])];
    newHeaders[index] = value;
    updateData({ headers: newHeaders });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = (data.rows || []).map((row) => [...row]);
    newRows[rowIndex][colIndex] = value;
    updateData({ rows: newRows });
  };

  return (
    <div className="flex flex-col justify-center h-full w-full px-40 py-24 relative z-10">
      <EditableText
        tag="h1"
        text={data.title}
        onChange={(val: string) => updateData({ title: val })}
        className="text-6xl font-bold text-[var(--slide-text-main)] mb-16 tracking-tight"
      />
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--slide-border)' }}
      >
        <table className="w-full text-left">
          <thead>
            <tr style={{ backgroundColor: 'var(--slide-accent)', color: '#ffffff' }}>
              {(data.headers || []).map((header, index) => (
                <th key={index} className="px-10 py-6 w-1/4 max-w-[25%] truncate">
                  <EditableText
                    tag="span"
                    text={header}
                    onChange={(val: string) => handleHeaderChange(index, val)}
                    className="text-2xl font-bold block truncate"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.rows || []).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t"
                style={{
                  borderColor: 'var(--slide-border)',
                  backgroundColor: 'var(--slide-card-bg)',
                }}
              >
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="px-10 py-6 max-w-[25%]">
                    <EditableText
                      tag="span"
                      text={cell}
                      onChange={(val: string) => handleCellChange(rowIndex, colIndex, val)}
                      className="text-2xl text-[var(--slide-text-main)] block truncate"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
