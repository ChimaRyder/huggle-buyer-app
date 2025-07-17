# Masonry Grid Implementation (Google Photos Style)

## Overview
This project uses [`@react-native-seoul/masonry-list`](https://github.com/react-native-seoul/masonry-list) to implement a dynamic, compact masonry grid layout for displaying posts, similar to Google Photos. The grid adapts to screen size, supports variable image heights, and is optimized for performance.

## Key Implementation Details
- **Component:** `MasonryList` from `@react-native-seoul/masonry-list` is used in `app/(tabs)/SearchScreen.tsx`.
- **Dynamic Columns:** The number of columns is determined by the device width (`numColumns`).
- **Post Data:** Posts are fetched from the backend and rendered as masonry items.
- **Image Aspect Ratio:** Images use `aspectRatio` for a visually compact layout. You can further randomize or use backend-provided aspect ratios for a more dynamic look.
- **Styling:** Each grid item uses rounded corners, shadows, and spacing for a modern appearance.

## Customization Tips
- To make the grid more like Google Photos, ensure:
  - Images have variable heights (not all the same aspect ratio).
  - Spacing between items is minimal but consistent.
  - The grid is scrollable and performant with many images.
- You can customize the `renderItem` function in `SearchScreen.tsx` to:
  - Use different aspect ratios.
  - Add overlays, icons, or selection states.

## Example Usage
See `app/(tabs)/SearchScreen.tsx` for the full implementation.

---

## Dependencies
- `@react-native-seoul/masonry-list`

Install with:
```sh
npm install @react-native-seoul/masonry-list
```

---

## Further Improvements
- Add infinite scroll/pagination for large datasets.
- Support pinch-to-zoom or selection modes.
- Animate item loading for a smoother UX.

---

For any questions or further customization, see the official [MasonryList documentation](https://github.com/react-native-seoul/masonry-list) or ask Cascade for help!
