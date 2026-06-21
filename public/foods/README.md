# 음식 아이콘 이미지

여기에 음식 아이콘 이미지(png/svg)를 넣어요. 예) `chicken.png`

넣은 뒤 `src/data/foods.ts` 에서 해당 음식에 경로를 적으면 이모지 대신 이미지가 보여요:

```ts
{ id: "f1", name: "닭가슴살", ..., image: "/foods/chicken.png" }
```

- 권장 크기: 정사각형 (예: 96×96 또는 128×128)
- 배경이 투명한 png 를 쓰면 더 깔끔해요.
