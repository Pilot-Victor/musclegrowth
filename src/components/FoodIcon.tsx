// ---------------------------------------------------------------------------
// FoodIcon — 음식 아이콘을 표시해요.
//
// 본인이 만든 이미지를 쓰고 싶다면:
//   1) 이미지 파일(png/svg)을 프로젝트의 `public/foods/` 폴더에 넣어요.
//      예) public/foods/chicken.png
//   2) src/data/foods.ts 에서 해당 음식에 image 경로를 추가해요.
//      예) { id: "f1", name: "닭가슴살", ..., image: "/foods/chicken.png" }
//
// image 가 없으면 기존처럼 이모지(emoji)를 그대로 보여줘요.
// ---------------------------------------------------------------------------

interface Props {
  emoji?: string;
  image?: string;
  /** 픽셀 단위 크기 (정사각형). 기본 28 */
  size?: number;
}

export default function FoodIcon({ emoji, image, size = 28 }: Props) {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        width={size}
        height={size}
        style={{ objectFit: "contain", display: "block" }}
      />
    );
  }
  return <span style={{ fontSize: size }}>{emoji ?? "🍽️"}</span>;
}
