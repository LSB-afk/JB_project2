# UI Density Measurement - after

| Route | Scroll height | Client height | Child sum | Layout spacing | Excess gap | Bottom waste | Visible items | Console errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
#dashboard | 3392 | 3392 | 3304 | 88 | 24 | 24 | 6 | 0
#inbox | 396 | 396 | 344 | 52 | 24 | 24 | 3 | 0
#cases | 720 | 720 | 668 | 52 | 24 | 24 | 5 | 0
#approvals | 546 | 546 | 494 | 52 | 24 | 24 | 2 | 0
#runs | 574 | 574 | 523 | 51 | 24 | 24 | 7 | 0
#jeonse | 925 | 925 | 873 | 52 | 24 | 24 | 6 | 0
#goals | 337 | 337 | 285 | 52 | 24 | 24 | 10 | 0
#agents | 1769 | 1769 | 1706 | 63 | 24 | 24 | 17 | 0
#orgchart | 1432 | 1432 | 1380 | 52 | 24 | 24 | 5 | 0
#skills | 1514 | 1514 | 1450 | 64 | 24 | 24 | 24 | 0
#routines | 612 | 612 | 560 | 52 | 24 | 24 | 10 | 0
#activity | 595 | 595 | 543 | 52 | 24 | 24 | 11 | 0
#budget | 1268 | 1268 | 1192 | 76 | 24 | 24 | 7 | 0
#settings | 441 | 441 | 389 | 52 | 24 | 24 | 4 | 0

Measurement definition:
- `layoutSpacingPx` = `.page-content.scrollHeight - direct child height sum`.
- `excessGapPx` = gaps above the 16px baseline plus bottom waste below the last visible child.
- `visibleItems` counts cards, rows, run cards, agent cards, skill cards, evidence, audit, and table-like rows visible in the 1920x1080 viewport.
