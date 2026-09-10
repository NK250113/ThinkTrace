import { useState, type PointerEvent, type RefObject } from "react";

type ResizerProps = {
  targetRef: RefObject<HTMLDivElement | null>;
  minHeight?: number;
  maxHeight?: number;
};
export function ResizerY({
  targetRef,
  minHeight = 100,
  maxHeight = 600,
}: ResizerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();

    setIsDragging(true);

    // pointerupまで、この要素がイベントを受け取り続ける
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !targetRef.current) return;

    const target = targetRef.current;

    // 対象要素の上端を基準に高さを計算
    const rect = target.getBoundingClientRect();
    let newHeight = e.clientY - rect.top;

    // 最小・最大を適用
    newHeight = Math.max(minHeight, newHeight);
    newHeight = Math.min(maxHeight, newHeight);

    target.style.height = `${newHeight}px`;
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setIsDragging(false)}
      style={{
        height: "8px",
        cursor: "ns-resize",
        touchAction: "none",
        userSelect: "none",
        backgroundColor: isDragging ? "#999" : "#ccc",
      }}
    />
  );
}

/*
export default function Example() {
  const firstRef = useRef(null);
  const secondRef = useRef(null);

  return (
    <div>
      {// 1つ目}
      <div
        ref={firstRef}
        style={{
          height: "200px",
          minHeight: "100px",
          maxHeight: "500px",
          overflow: "auto",
          background: "#eee",
        }}
      >
        1つ目の要素
      </div>

      {// 1つ目と2つ目の境界}
      <Resizer
        targetRef={firstRef}
        minHeight={100}
        maxHeight={500}
      />

      {// 2つ目}
      <div
        ref={secondRef}
        style={{
          height: "200px",
          minHeight: "100px",
          maxHeight: "500px",
          overflow: "auto",
          background: "#ddd",
        }}
      >
        2つ目の要素
      </div>

      {// 2つ目と3つ目の境界}
      <Resizer
        targetRef={secondRef}
        minHeight={100}
        maxHeight={500}
      />

      {// 3つ目}
      <div
        style={{
          background: "#ccc",
        }}
      >
        3つ目の要素
      </div>
    </div>
  );
}
*/